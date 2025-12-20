import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Device } from './domain/device.entity';
import { DeviceStatus } from './domain/device-status.enum';
import { DeviceRepository } from './repository/device.repository';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { ReviewAction, ReviewRequestDto } from './dto/review-request.dto';
import { BusinessException } from '../common/errors/business.exception';
import { LoggerService } from '../common/logging/logger.service';
import {
  DeviceRegistrationRequestedEvent,
  DeviceApprovedEvent,
  DeviceRejectedEvent,
  DeviceDecommissionedEvent,
} from './events/device-events';

@Injectable()
export class DevicesService {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {}

  async registerDevice(dto: RegisterDeviceDto): Promise<Device> {
    this.logger.log(
      `Registration request received for device: ${dto.deviceId}`,
      'DevicesService',
    );

    // 중복 등록 요청 처리
    const existing = await this.deviceRepository.findByDeviceId(dto.deviceId);
    if (existing) {
      if (existing.status === DeviceStatus.PENDING) {
        this.logger.warn(
          `Duplicate registration request for device: ${dto.deviceId}`,
          'DevicesService',
        );
        return existing; // 이미 대기 중인 요청 반환
      }
      if (existing.status === DeviceStatus.REGISTERED) {
        throw new BusinessException(
          'DEVICE_ALREADY_REGISTERED',
          'Device is already registered and active',
        );
      }
    }

    const device = new Device({
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
      manufacturer: dto.manufacturer,
      model: dto.model,
      firmwareVersion: dto.firmwareVersion,
      location: dto.location,
      status: DeviceStatus.PENDING,
      requestedAt: new Date(),
    });

    const savedDevice = await this.deviceRepository.save(device);

    this.eventEmitter.emit(
      'device.registration.requested',
      new DeviceRegistrationRequestedEvent(
        savedDevice.deviceId,
        savedDevice.deviceName,
        new Date(),
      ),
    );

    return savedDevice;
  }

  async getPendingRequests(): Promise<Device[]> {
    return this.deviceRepository.findByStatus(DeviceStatus.PENDING);
  }

  async reviewDevice(id: string, dto: ReviewRequestDto): Promise<Device> {
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new BusinessException('DEVICE_NOT_FOUND', 'Device not found');
    }

    if (device.status !== DeviceStatus.PENDING) {
      throw new BusinessException(
        'INVALID_DEVICE_STATUS',
        'Only pending devices can be reviewed',
      );
    }

    if (dto.action === ReviewAction.APPROVE) {
      device.status = DeviceStatus.REGISTERED;
      device.reviewedAt = new Date();
      device.reviewedBy = dto.reviewedBy;

      const updatedDevice = await this.deviceRepository.save(device);

      this.eventEmitter.emit(
        'device.approved',
        new DeviceApprovedEvent(device.deviceId, dto.reviewedBy, new Date()),
      );

      this.logger.log(
        `Device approved: ${device.deviceId} by ${dto.reviewedBy}`,
        'DevicesService',
      );

      return updatedDevice;
    } else {
      device.status = DeviceStatus.UNREGISTERED;
      device.rejectionReason = dto.rejectionReason;
      device.reviewedAt = new Date();
      device.reviewedBy = dto.reviewedBy;

      const updatedDevice = await this.deviceRepository.save(device);

      this.eventEmitter.emit(
        'device.rejected',
        new DeviceRejectedEvent(
          device.deviceId,
          dto.rejectionReason,
          dto.reviewedBy,
          new Date(),
        ),
      );

      this.logger.log(
        `Device rejected: ${device.deviceId} by ${dto.reviewedBy}`,
        'DevicesService',
      );

      return updatedDevice;
    }
  }

  async getAllDevices(): Promise<Device[]> {
    return this.deviceRepository.findAll();
  }

  async getDeviceById(id: string): Promise<Device> {
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new BusinessException('DEVICE_NOT_FOUND', 'Device not found');
    }
    return device;
  }

  async decommissionDevice(id: string): Promise<Device> {
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new BusinessException('DEVICE_NOT_FOUND', 'Device not found');
    }

    if (device.status !== DeviceStatus.REGISTERED) {
      throw new BusinessException(
        'INVALID_DEVICE_STATUS',
        'Only registered devices can be decommissioned',
      );
    }

    device.status = DeviceStatus.DECOMMISSIONED;
    device.updatedAt = new Date();

    const updatedDevice = await this.deviceRepository.save(device);

    this.eventEmitter.emit(
      'device.decommissioned',
      new DeviceDecommissionedEvent(device.deviceId, new Date()),
    );

    this.logger.log(`Device decommissioned: ${device.deviceId}`, 'DevicesService');

    return updatedDevice;
  }
}