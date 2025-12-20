import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Device } from './domain/device.entity';
import { DeviceStatus } from './domain/device-status.enum';
import { IDeviceRepository } from './repository/device.repository.interface';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto, ReviewDeviceDto } from './dto/update-device.dto';
import { DeviceEvent } from './events/device-events.handler';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private readonly deviceRepository: IDeviceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async requestRegistration(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const existingDevice = await this.deviceRepository.findByDeviceId(
      createDeviceDto.deviceId,
    );

    if (existingDevice) {
      if (existingDevice.status === DeviceStatus.PENDING) {
        this.logger.log(`이미 등록 요청 대기 중인 장치: ${createDeviceDto.deviceId}`);
        return existingDevice;
      }

      if (existingDevice.status === DeviceStatus.REGISTERED) {
        throw new ConflictException('이미 등록된 장치입니다.');
      }

      if (existingDevice.status === DeviceStatus.DECOMMISSIONED) {
        this.logger.log(`해제된 장치 재등록 요청: ${createDeviceDto.deviceId}`);
      }
    }

    const device = new Device({
      ...createDeviceDto,
      status: DeviceStatus.PENDING,
      registrationRequestedAt: new Date(),
    });

    const savedDevice = await this.deviceRepository.save(device);
    
    this.eventEmitter.emit('device.status.changed', new DeviceEvent(
      savedDevice.deviceId,
      DeviceStatus.UNREGISTERED,
      DeviceStatus.PENDING,
      new Date(),
    ));

    this.logger.log(`장치 등록 요청: ${savedDevice.deviceId}`);
    return savedDevice;
  }

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.findAll();
  }

  async findPendingDevices(): Promise<Device[]> {
    return this.deviceRepository.findByStatus(DeviceStatus.PENDING);
  }

  async findById(id: string): Promise<Device> {
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new NotFoundException(`장치를 찾을 수 없습니다: ${id}`);
    }
    return device;
  }

  async reviewRegistration(id: string, reviewDto: ReviewDeviceDto): Promise<Device> {
    const device = await this.findById(id);
    
    if (device.status !== DeviceStatus.PENDING) {
      throw new BadRequestException('등록 요청 대기 중인 장치만 검토할 수 있습니다.');
    }

    const oldStatus = device.status;
    const updates: Partial<Device> = {
      status: reviewDto.status,
    };

    if (reviewDto.status === DeviceStatus.REGISTERED) {
      updates.registeredAt = new Date();
    } else if (reviewDto.status === DeviceStatus.DECOMMISSIONED && reviewDto.rejectionReason) {
      updates.rejectionReason = reviewDto.rejectionReason;
    }

    const updatedDevice = await this.deviceRepository.update(id, updates);
    if (!updatedDevice) {
      throw new NotFoundException(`장치를 찾을 수 없습니다: ${id}`);
    }

    this.eventEmitter.emit('device.status.changed', new DeviceEvent(
      updatedDevice.deviceId,
      oldStatus,
      updatedDevice.status,
      new Date(),
      reviewDto.rejectionReason,
    ));

    if (updatedDevice.status === DeviceStatus.REGISTERED) {
      this.eventEmitter.emit('device.registered', updatedDevice);
    }

    this.logger.log(`장치 검토 완료: ${id} -> ${reviewDto.status}`);
    return updatedDevice;
  }

  async decommissionDevice(id: string, reason?: string): Promise<Device> {
    const device = await this.findById(id);
    
    if (device.status !== DeviceStatus.REGISTERED) {
      throw new BadRequestException('등록된 장치만 해제할 수 있습니다.');
    }

    const oldStatus = device.status;
    const updates: Partial<Device> = {
      status: DeviceStatus.DECOMMISSIONED,
      decommissionedAt: new Date(),
      rejectionReason: reason,
    };

    const updatedDevice = await this.deviceRepository.update(id, updates);
    if (!updatedDevice) {
      throw new NotFoundException(`장치를 찾을 수 없습니다: ${id}`);
    }

    this.eventEmitter.emit('device.status.changed', new DeviceEvent(
      updatedDevice.deviceId,
      oldStatus,
      DeviceStatus.DECOMMISSIONED,
      new Date(),
      reason,
    ));

    this.eventEmitter.emit('device.decommissioned', updatedDevice);
    this.logger.log(`장치 해제 완료: ${id}`);
    return updatedDevice;
  }

  async updateDevice(id: string, updateDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findById(id);
    
    if (updateDto.status && updateDto.status !== device.status) {
      throw new BadRequestException('상태 변경은 별도의 API를 사용해주세요.');
    }

    const updatedDevice = await this.deviceRepository.update(id, updateDto);
    if (!updatedDevice) {
      throw new NotFoundException(`장치를 찾을 수 없습니다: ${id}`);
    }

    this.logger.log(`장치 정보 업데이트: ${id}`);
    return updatedDevice;
  }
}
