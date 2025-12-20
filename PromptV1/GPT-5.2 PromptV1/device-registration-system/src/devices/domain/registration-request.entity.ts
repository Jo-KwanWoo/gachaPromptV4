import { RegistrationRequestStatus } from './registration-request-status.enum';

export class RegistrationRequest {
  constructor(init: RegistrationRequest) {
    Object.assign(this, init);
  }

  requestId!: string;
  deviceId!: string;

  snapshot!: {
    model: string;
    serialNumber?: string;
    firmwareVersion?: string;
    macAddress?: string;
  };

  status!: RegistrationRequestStatus;

  requestedAt!: Date;
  reviewedAt?: Date;

  rejectionReason?: string;
}
