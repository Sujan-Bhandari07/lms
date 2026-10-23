// this is for microservices not gateway 
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class ServiceExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(ServiceExceptionFilter.name);

 override catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';

    if (exception instanceof RpcException) {
      const err = exception.getError();

      if (typeof err === 'string') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = err;
      } else if (err && typeof err === 'object') {
        statusCode = (err as any).statusCode ?? HttpStatus.BAD_REQUEST;
        message = (err as any).message ?? message;
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body: any = exception.getResponse();
      message =
        typeof body === 'string'
          ? body
          : Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message ?? message;
    } else {
      // unexpected error: log it, hide the details from the client
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    if (statusCode >= 500) this.logger.error(message);

    return throwError(() => ({ success: false, statusCode, message }));
  }
}

//   app.useGlobalFilters(new ServiceExceptionFilter()); in main.ts of services