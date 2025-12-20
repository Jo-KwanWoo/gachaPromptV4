import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER } from '@nestjs/core';
import { DevicesModule } from './devices/devices.module';
import { HttpExceptionFilter } from './common/errors/http-exception.filter';
import { LoggerService } from './common/logging/logger.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DevicesModule,
  ],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}