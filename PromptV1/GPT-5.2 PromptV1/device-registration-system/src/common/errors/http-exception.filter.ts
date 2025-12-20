import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { ApiErrorCode } from './api-error-code';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse();
      const req = ctx.getRequest();
  
      const isHttp = exception instanceof HttpException;
      const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const payload = isHttp
        ? exception.getResponse()
        : {
            code: ApiErrorCode.INTERNAL_ERROR,
            message: 'Unexpected server error',
          };
  
      Logger.error(
        {
          path: req?.url,
          method: req?.method,
          status,
          payload,
        },
        (exception as any)?.stack,
      );
  
      res.status(status).json({
        success: false,
        error: payload,
      });
    }
  }
  