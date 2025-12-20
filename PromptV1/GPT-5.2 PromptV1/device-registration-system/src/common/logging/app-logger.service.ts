import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger {
  private readonly logger = new Logger('DeviceRegistration');

  info(message: string, meta?: Record<string, any>) {
    this.logger.log(meta ? `${message} ${JSON.stringify(meta)}` : message);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(meta ? `${message} ${JSON.stringify(meta)}` : message);
  }

  error(message: string, meta?: Record<string, any>) {
    this.logger.error(meta ? `${message} ${JSON.stringify(meta)}` : message);
  }
}
