import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { LoggerService } from '../logging/logger.service';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) {}
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let code = 'INTERNAL_SERVER_ERROR';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
  
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          const responseObj = exceptionResponse as any;
          message = responseObj.message || message;
          code = responseObj.code || code;
        } else {
          message = exceptionResponse as string;
        }
      }
  
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : '',
        'HttpExceptionFilter',
      );
  
      response.status(status).json({
        success: false,
        code,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }