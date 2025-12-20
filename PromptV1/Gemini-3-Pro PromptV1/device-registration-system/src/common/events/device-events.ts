export class DeviceStateChangedEvent {
    constructor(
      public readonly deviceId: string,
      public readonly oldStatus: string,
      public readonly newStatus: string,
      public readonly payload?: any,
    ) {}
  }