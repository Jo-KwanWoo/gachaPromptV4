import { DeviceStatus } from './device-status.enum';

export class Device {
  constructor(init: Device) {
    Object.assign(this, init);
  }

  deviceId!: string;

  model!: string;
  serialNumber?: string;
  firmwareVersion?: string;
  macAddress?: string;

  status!: DeviceStatus;

  createdAt!: Date;
  updatedAt!: Date;

  lastRegistrationRequestId?: string;
  decommissionReason?: string;
}
