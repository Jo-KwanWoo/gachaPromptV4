import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { InMemoryDeviceRepository } from './repository/device.repository';
import { DeviceEventsHandler } from './events/device-events.handler';

@Module({
  controllers: [DevicesController],
  providers: [
    DevicesService,
    {
      provide: 'IDeviceRepository',
      useClass: InMemoryDeviceRepository,
    },
    DeviceEventsHandler,
  ],
  exports: [DevicesService],
})
export class DevicesModule {}
