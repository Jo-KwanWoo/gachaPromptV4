import { Injectable } from '@nestjs/common';
import { Device } from '../domain/device.entity';
import { IDeviceRepository } from './device.repository.interface';
import { DeviceStatus } from '../domain/device-status.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryDeviceRepository implements IDeviceRepository {
  private devices: Map<string, Device> = new Map();

  async save(device: Device): Promise<Device> {
    if (!device.id) {
      device.id = uuidv4();
    }
    this.devices.set(device.id, device);
    return device;
  }

  async findById(id: string): Promise<Device | null> {
    return this.devices.get(id) || null;
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    for (const device of this.devices.values()) {
      if (device.deviceId === deviceId) {
        return device;
      }
    }
    return null;
  }

  async findAll(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async findByStatus(status: DeviceStatus): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(
      (device) => device.status === status,
    );
  }

  async update(id: string, updates: Partial<Device>): Promise<Device | null> {
    const device = this.devices.get(id);
    if (!device) {
      return null;
    }

    const updatedDevice = new Device({
      ...device,
      ...updates,
      updatedAt: new Date(),
    });

    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async delete(id: string): Promise<void> {
    this.devices.delete(id);
  }
}
