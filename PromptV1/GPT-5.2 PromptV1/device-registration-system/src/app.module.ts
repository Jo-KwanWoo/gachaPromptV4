import { Module } from '@nestjs/common';
import { DevicesModule } from './devices/devices.module';
import { AppLogger } from './common/logging/app-logger.service';
import { DomainEventBus } from './common/events/domain-event-bus';

@Module({
  imports: [DevicesModule],
  providers: [AppLogger, DomainEventBus],
})
export class AppModule {}
