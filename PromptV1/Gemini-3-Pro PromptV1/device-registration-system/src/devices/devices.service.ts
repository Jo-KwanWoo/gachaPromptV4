import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    Logger,
  } from '@nestjs/common';
  import { EventEmitter2 } from '@nestjs/event-emitter';
  import { Device, DeviceStatus } from './domain/device.entity';
  import { InMemoryDeviceRepository } from './domain/device.repository';
  import { CreateDeviceDto } from './dto/create-device.dto';
  import { DeviceStateChangedEvent } from '../common/events/device-events';
  
  @Injectable()
  export class DevicesService {
    private readonly logger = new Logger(DevicesService.name);
  
    constructor(
      @Inject('DeviceRepository')
      private readonly deviceRepository: InMemoryDeviceRepository,
      private eventEmitter: EventEmitter2,
    ) {}
  
    // 1. 등록 요청
    async register(dto: CreateDeviceDto): Promise<Device> {
      const existing = await this.deviceRepository.findBySerialNumber(dto.serialNumber);
  
      if (existing) {
        if (
          existing.status === DeviceStatus.REGISTERED ||
          existing.status === DeviceStatus.PENDING
        ) {
          throw new ConflictException('Device is already active or pending.');
        }
        // 재등록 로직
        existing.status = DeviceStatus.PENDING;
        existing.modelName = dto.modelName;
        existing.updatedAt = new Date();
        existing.rejectionReason = undefined;
        
        const saved = await this.deviceRepository.save(existing);
        this.emitStateChange(saved.id, 'OLD_STATE', DeviceStatus.PENDING);
        return saved;
      }
  
      const newDevice = new Device({
        serialNumber: dto.serialNumber,
        modelName: dto.modelName,
        status: DeviceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      const saved = await this.deviceRepository.save(newDevice);
      this.emitStateChange(saved.id, DeviceStatus.UNREGISTERED, DeviceStatus.PENDING);
      return saved;
    }
  
    // 2. 조회
    async findAll(status?: DeviceStatus): Promise<Device[]> {
      if (status) {
        return this.deviceRepository.findByStatus(status);
      }
      return this.deviceRepository.findAll();
    }
  
    // 3. 승인
    async approve(id: string): Promise<Device> {
      const device = await this.findByIdOrThrow(id);
      if (device.status !== DeviceStatus.PENDING) {
        throw new BadRequestException('Only PENDING devices can be approved.');
      }
  
      const oldStatus = device.status;
      device.status = DeviceStatus.REGISTERED;
      device.updatedAt = new Date();
  
      await this.deviceRepository.save(device);
      this.emitStateChange(device.id, oldStatus, DeviceStatus.REGISTERED);
      return device;
    }
  
    // 3. 거부
    async reject(id: string, reason: string): Promise<Device> {
      const device = await this.findByIdOrThrow(id);
      if (device.status !== DeviceStatus.PENDING) {
        throw new BadRequestException('Only PENDING devices can be rejected.');
      }
  
      const oldStatus = device.status;
      device.status = DeviceStatus.REJECTED;
      device.rejectionReason = reason;
      device.updatedAt = new Date();
  
      await this.deviceRepository.save(device);
      this.emitStateChange(device.id, oldStatus, DeviceStatus.REJECTED, { reason });
      return device;
    }
  
    // 5. 해제
    async decommission(id: string): Promise<Device> {
      const device = await this.findByIdOrThrow(id);
      if (device.status !== DeviceStatus.REGISTERED) {
        throw new BadRequestException('Only REGISTERED devices can be decommissioned.');
      }
  
      const oldStatus = device.status;
      device.status = DeviceStatus.DECOMMISSIONED;
      device.updatedAt = new Date();
  
      await this.deviceRepository.save(device);
      this.emitStateChange(device.id, oldStatus, DeviceStatus.DECOMMISSIONED);
      return device;
    }
  
    private async findByIdOrThrow(id: string): Promise<Device> {
      const device = await this.deviceRepository.findById(id);
      if (!device) throw new NotFoundException(`Device with ID ${id} not found.`);
      return device;
    }
  
    private emitStateChange(id: string, oldStatus: string, newStatus: string, payload?: any) {
      this.logger.log(`State change: ${oldStatus} -> ${newStatus} for Device ${id}`);
      this.eventEmitter.emit(
        'device.state_changed',
        new DeviceStateChangedEvent(id, oldStatus, newStatus, payload),
      );
    }
  }