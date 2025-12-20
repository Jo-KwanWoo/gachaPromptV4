import { Injectable } from '@nestjs/common';
import { RegistrationRequestsRepository } from '../registration-requests.repository';
import { RegistrationRequest } from '../../domain/registration-request.entity';
import { RegistrationRequestStatus } from '../../domain/registration-request-status.enum';

@Injectable()
export class InMemoryRegistrationRequestsRepository implements RegistrationRequestsRepository {
  private readonly store = new Map<string, RegistrationRequest>();
  private readonly byDevice = new Map<string, string[]>(); // deviceId -> [requestId...]

  async create(req: RegistrationRequest): Promise<RegistrationRequest> {
    this.store.set(req.requestId, req);
    const list = this.byDevice.get(req.deviceId) ?? [];
    list.push(req.requestId);
    this.byDevice.set(req.deviceId, list);
    return req;
  }

  async findById(requestId: string): Promise<RegistrationRequest | null> {
    return this.store.get(requestId) ?? null;
  }

  async findLatestByDeviceId(deviceId: string): Promise<RegistrationRequest | null> {
    const ids = this.byDevice.get(deviceId) ?? [];
    if (ids.length === 0) return null;
    const latestId = ids[ids.length - 1];
    return this.store.get(latestId) ?? null;
  }

  async list(status?: RegistrationRequestStatus): Promise<RegistrationRequest[]> {
    const all = Array.from(this.store.values()).sort(
      (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime(),
    );
    return status ? all.filter((x) => x.status === status) : all;
  }

  async update(req: RegistrationRequest): Promise<RegistrationRequest> {
    this.store.set(req.requestId, req);
    return req;
  }
}
