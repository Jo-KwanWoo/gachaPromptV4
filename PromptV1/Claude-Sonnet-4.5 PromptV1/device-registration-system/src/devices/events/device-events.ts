import { DeviceStatus } from '../domain/device-status.enum';

export class DeviceRegistrationRequestedEvent {
  constructor(
    public readonly deviceId: string,
    public readonly deviceName: string,
    public readonly timestamp: Date,
  ) {}
}

export class DeviceApprovedEvent {
  constructor(
    public readonly deviceId: string,
    public readonly reviewedBy: string,
    public readonly timestamp: Date,
  ) {}
}

export class DeviceRejectedEvent {
  constructor(
    public readonly deviceId: string,
    public readonly rejectionReason: string,
    public readonly reviewedBy: string,
    public readonly timestamp: Date,
  ) {}
}

export class DeviceDecommissionedEvent {
  constructor(
    public readonly deviceId: string,
    public readonly timestamp: Date,
  ) {}
}