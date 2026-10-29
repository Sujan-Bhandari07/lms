// this is for microservices not gateway 
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
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
export class ServiceExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(ServiceExceptionFilter.name);

  override catch(exception: unknown, _host: ArgumentsHost): Observable<unknown> {
    void _host;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    const rpcError = exception instanceof RpcException ? exception.getError() : undefined;
    const rpcErrorDetails = objectDetails(rpcError);
    const error =
      rpcError instanceof Error
        ? rpcError
        : exception instanceof Error
          ? exception
          : undefined;

    if (exception instanceof RpcException) {
      if (typeof rpcError === 'string') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = rpcError;
      } else if (rpcError && typeof rpcError === 'object') {
        const code = rpcErrorDetails?.statusCode ?? rpcErrorDetails?.status;
        if (
          typeof code === 'number' &&
          Number.isInteger(code) &&
          code >= 400 &&
          code < 600
        ) {
          statusCode = code;
        }
        if (typeof rpcErrorDetails?.message === 'string') {
          message = rpcErrorDetails.message;
        }
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exceptionResponseMessage(exception.getResponse()) ?? message;
    }

    if (
      exception instanceof Error &&
      exception.name === 'TimeoutError'
    ) {
      statusCode = HttpStatus.GATEWAY_TIMEOUT;
      message = 'A downstream service timed out.';
    }

    const errorMessage =
      typeof rpcErrorDetails?.message === 'string'
        ? rpcErrorDetails.message
        : error?.message ??
          (typeof rpcError === 'string' ? rpcError : String(exception));
    const stack =
      typeof rpcErrorDetails?.stack === 'string'
        ? rpcErrorDetails.stack
        : error?.stack;
    this.logger.error(
      JSON.stringify({
        event: 'rpc.exception',
        exceptionName: error?.name ?? 'RpcException',
        message: sanitizeDiagnosticText(errorMessage),
        statusCode,
        stack: sanitizeDiagnosticText(stack),
      }),
    );

    return throwError(() => ({ success: false, statusCode, message }));
  }
}

//   app.useGlobalFilters(new ServiceExceptionFilter()); in main.ts of services