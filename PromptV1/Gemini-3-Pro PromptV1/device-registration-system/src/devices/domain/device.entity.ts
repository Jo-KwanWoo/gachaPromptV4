export enum DeviceStatus {
    UNREGISTERED = 'UNREGISTERED',
    PENDING = 'PENDING',
    REGISTERED = 'REGISTERED',
    REJECTED = 'REJECTED',
    DECOMMISSIONED = 'DECOMMISSIONED',
  }
  
  export class Device {
    id: string;
    serialNumber: string;
    modelName: string;
    status: DeviceStatus;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
  
    constructor(partial: Partial<Device>) {
      Object.assign(this, partial);
    }
  }