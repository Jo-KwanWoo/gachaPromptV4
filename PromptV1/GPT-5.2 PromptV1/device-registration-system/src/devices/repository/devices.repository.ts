import { Device } from '../domain/device.entity';

export abstract class DevicesRepository {
  abstract findById(deviceId: string): Promise<Device | null>;
  abstract upsert(device: Device): Promise<Device>;
  abstract listAll(): Promise<Device[]>;
}
