
// this is only for gateway
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import {
  exceptionResponseMessage,
  sanitizeDiagnosticText,
} from './rmq-diagnostics';

function objectDetails(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    const rpcError = exception instanceof RpcException ? exception.getError() : exception;
    const rpcErrorDetails = objectDetails(rpcError);
    const error = rpcError instanceof Error ? rpcError : exception;
    const errorName =
      typeof rpcErrorDetails?.name === 'string'
        ? rpcErrorDetails.name
        : error instanceof Error
          ? error.name
          : 'RemoteServiceError';
    const errorMessage =
      typeof rpcErrorDetails?.message === 'string'
        ? rpcErrorDetails.message
        : error instanceof Error
          ? error.message
          : typeof rpcError === 'string'
            ? rpcError
            : String(rpcError);

    // Gateway's own HTTP errors (ValidationPipe, guards, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exceptionResponseMessage(exception.getResponse()) ?? message;
    } else {
      if (errorName === 'TimeoutError') {
        status = HttpStatus.GATEWAY_TIMEOUT;
        message = 'A downstream service timed out.';
      } else if (typeof rpcError === 'string') {
        status = HttpStatus.BAD_REQUEST;
        message = rpcError;
      } else if (rpcError && typeof rpcError === 'object') {
        const code = rpcErrorDetails?.statusCode ?? rpcErrorDetails?.status;
        if (
          typeof code === 'number' &&
          Number.isInteger(code) &&
          code >= 400 &&
          code < 600
        ) {
          status = code;
          if (code < 500) {
            message =
              typeof rpcErrorDetails?.message === 'string'
                ? rpcErrorDetails.message
                : message;
          } else if (code === HttpStatus.GATEWAY_TIMEOUT) {
            message = 'A downstream service timed out.';
          }
        }
      }
    }

    this.logger.error(
      JSON.stringify({
        event: 'gateway.exception',
        exceptionName: errorName,
        message: sanitizeDiagnosticText(errorMessage),
        statusCode: status,
        stack: typeof rpcErrorDetails?.stack === 'string'
          ? sanitizeDiagnosticText(rpcErrorDetails.stack)
          : error instanceof Error
            ? sanitizeDiagnosticText(error.stack)
            : undefined,
      }),
    );

    return response.status(status).json({ success: false, message });
  }
}

//   app.useGlobalFilters(new GatewayExceptionFilter()); in main.ts of gateway