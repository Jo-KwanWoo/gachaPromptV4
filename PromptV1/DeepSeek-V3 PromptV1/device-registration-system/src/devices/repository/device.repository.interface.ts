import { Device } from '../domain/device.entity';
import { DeviceStatus } from '../domain/device-status.enum';

export interface IDeviceRepository {
  save(device: Device): Promise<Device>;
  findById(id: string): Promise<Device | null>;
  findByDeviceId(deviceId: string): Promise<Device | null>;
  findAll(): Promise<Device[]>;
  findByStatus(status: DeviceStatus): Promise<Device[]>;
  update(id: string, device: Partial<Device>): Promise<Device | null>;
  delete(id: string): Promise<void>;
}
