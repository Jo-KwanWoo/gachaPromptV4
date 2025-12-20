import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DevicesModule } from './devices/devices.module';
import { HttpExceptionFilter } from './common/errors/http-exception.filter';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { LoggingInterceptor } from './common/logging/logging.interceptor';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DevicesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
