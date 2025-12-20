import { DeviceStatus } from './device-status.enum';

export class Device {
  id: string;
  deviceId: string;
  model: string;
  serialNumber: string;
  location?: string;
  status: DeviceStatus;
  registrationRequestedAt?: Date;
  registeredAt?: Date;
  decommissionedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Device>) {
    Object.assign(this, partial);
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = new Date();
  }
}
