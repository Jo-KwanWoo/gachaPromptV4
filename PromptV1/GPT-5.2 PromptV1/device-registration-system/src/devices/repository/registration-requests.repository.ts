import { RegistrationRequest } from '../domain/registration-request.entity';
import { RegistrationRequestStatus } from '../domain/registration-request-status.enum';

export abstract class RegistrationRequestsRepository {
  abstract create(req: RegistrationRequest): Promise<RegistrationRequest>;
  abstract findById(requestId: string): Promise<RegistrationRequest | null>;
  abstract findLatestByDeviceId(deviceId: string): Promise<RegistrationRequest | null>;
  abstract list(status?: RegistrationRequestStatus): Promise<RegistrationRequest[]>;
  abstract update(req: RegistrationRequest): Promise<RegistrationRequest>;
}
