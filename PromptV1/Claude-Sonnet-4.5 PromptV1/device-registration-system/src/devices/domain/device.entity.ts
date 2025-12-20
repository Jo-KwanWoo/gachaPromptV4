import { DeviceStatus } from './device-status.enum';

export class Device {
  id: string;
  deviceId: string; // 장치 고유 식별자
  deviceName: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  location?: string;
  status: DeviceStatus;
  rejectionReason?: string;
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Device>) {
    Object.assign(this, partial);
  }
}