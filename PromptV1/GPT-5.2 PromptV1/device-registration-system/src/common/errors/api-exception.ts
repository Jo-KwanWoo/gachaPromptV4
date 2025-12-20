import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from './api-error-code';

export class ApiException extends HttpException {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    status: HttpStatus,
    public readonly details?: Record<string, any>,
  ) {
    super({ code, message, details }, status);
  }
}
