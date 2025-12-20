import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';
import { InMemoryDeviceRepository } from './devices/domain/device.repository';
import { DevicesListener } from './devices/devices.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [DevicesController],
  providers: [
    DevicesService,
    DevicesListener,
    {
      provide: 'DeviceRepository',
      useClass: InMemoryDeviceRepository,
    },
  ],
})
export class AppModule {}