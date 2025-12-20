import { DeviceStatus } from '../domain/device-status.enum';

export class DeviceResponseDto {
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
}
