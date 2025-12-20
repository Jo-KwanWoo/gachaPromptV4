import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './repository/devices.repository';
import { RegistrationRequestsRepository } from './repository/registration-requests.repository';
import { InMemoryDevicesRepository } from './repository/in-memory/in-memory-devices.repository';
import { InMemoryRegistrationRequestsRepository } from './repository/in-memory/in-memory-registration-requests.repository';
import { AppLogger } from '../common/logging/app-logger.service';
import { DomainEventBus } from '../common/events/domain-event-bus';

@Module({
  controllers: [DevicesController],
  providers: [
    DevicesService,
    AppLogger,
    DomainEventBus,
    { provide: DevicesRepository, useClass: InMemoryDevicesRepository },
    { provide: RegistrationRequestsRepository, useClass: InMemoryRegistrationRequestsRepository },
  ],
})
export class DevicesModule {}
