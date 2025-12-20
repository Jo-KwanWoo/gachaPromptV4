import { DeviceStatus } from '../domain/device-status.enum';

export class DeviceResponseDto {
  id: string;
  deviceId: string;
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
}