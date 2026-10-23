
// this is only for gateway
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';

    // Gateway's own HTTP errors (ValidationPipe, guards, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body: any = exception.getResponse();
      message =
        typeof body === 'string'
          ? body
          : Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message ?? message;
    } else {
      const error: any = exception instanceof RpcException ? exception.getError() : exception;

      if (typeof error === 'string') {
        status = HttpStatus.BAD_REQUEST;
        message = error;
      } else {
        const code = error?.statusCode ?? error?.status;
        if (Number.isInteger(code) && code >= 400 && code < 600) {
          // deliberate error from a microservice
          status = code;
          message = error.message ?? message;
          if (code >= 500) this.logger.error(message);
        } else {
          // unexpected: log it, hide the details
          this.logger.error(
            'Unhandled exception',
            exception instanceof Error ? exception.stack : JSON.stringify(exception),
          );
        }
      }
    }

    return response.status(status).json({ success: false, message });
  }
}

//   app.useGlobalFilters(new GatewayExceptionFilter()); in main.ts of gateway