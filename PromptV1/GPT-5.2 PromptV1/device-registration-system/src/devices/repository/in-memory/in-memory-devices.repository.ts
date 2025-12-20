import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../devices.repository';
import { Device } from '../../domain/device.entity';

@Injectable()
export class InMemoryDevicesRepository implements DevicesRepository {
  private readonly store = new Map<string, Device>();

  async findById(deviceId: string): Promise<Device | null> {
    return this.store.get(deviceId) ?? null;
  }

  async upsert(device: Device): Promise<Device> {
    this.store.set(device.deviceId, device);
    return device;
  }

  async listAll(): Promise<Device[]> {
    return Array.from(this.store.values()).sort((a, b) => a.deviceId.localeCompare(b.deviceId));
  }
}
