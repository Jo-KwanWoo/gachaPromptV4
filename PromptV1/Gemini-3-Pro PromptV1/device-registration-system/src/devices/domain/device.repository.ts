import { Injectable } from '@nestjs/common';
import { Device, DeviceStatus } from './device.entity';

export interface IDeviceRepository {
  save(device: Device): Promise<Device>;
  findBySerialNumber(serialNumber: string): Promise<Device | null>;
  findById(id: string): Promise<Device | null>;
  findAll(): Promise<Device[]>;
  findByStatus(status: DeviceStatus): Promise<Device[]>;
}

@Injectable()
export class InMemoryDeviceRepository implements IDeviceRepository {
  // DB 역할을 하는 In-Memory Map
  private readonly devices = new Map<string, Device>();

  async save(device: Device): Promise<Device> {
    if (!device.id) {
      // 간단한 ID 생성 (실무에선 UUID 사용 권장)
      device.id = Math.random().toString(36).substring(2, 15);
    }
    this.devices.set(device.id, device);
    return device;
  }

  async findBySerialNumber(serialNumber: string): Promise<Device | null> {
    for (const device of this.devices.values()) {
      if (device.serialNumber === serialNumber) return device;
    }
    return null;
  }

  async findById(id: string): Promise<Device | null> {
    return this.devices.get(id) || null;
  }

  async findAll(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async findByStatus(status: DeviceStatus): Promise<Device[]> {
    return Array.from(this.devices.values()).filter((d) => d.status === status);
  }
}