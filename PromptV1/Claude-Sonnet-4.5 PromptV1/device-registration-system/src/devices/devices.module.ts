import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DeviceRepository } from './repository/device.repository';
import { DeviceEventHandler } from './events/device-event.handler';
import { LoggerService } from '../common/logging/logger.service';

@Module({
  controllers: [DevicesController],
  providers: [
    DevicesService,
    DeviceRepository,
    DeviceEventHandler,
    LoggerService,
  ],
})
export class DevicesModule {}