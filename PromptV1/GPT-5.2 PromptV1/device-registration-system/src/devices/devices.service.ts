import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DevicesRepository } from './repository/devices.repository';
import { RegistrationRequestsRepository } from './repository/registration-requests.repository';
import { DeviceStatus } from './domain/device-status.enum';
import { RegistrationRequestStatus } from './domain/registration-request-status.enum';
import { Device } from './domain/device.entity';
import { RegistrationRequest } from './domain/registration-request.entity';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { ApiException } from '../common/errors/api-exception';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { RejectRegistrationRequestDto } from './dto/reject-registration-request.dto';
import { DecommissionDeviceDto } from './dto/decommission-device.dto';
import { AppLogger } from '../common/logging/app-logger.service';
import { DomainEventBus } from '../common/events/domain-event-bus';
import { EVENTS } from '../common/events/events.constants';

@Injectable()
export class DevicesService {
  constructor(
    private readonly devicesRepo: DevicesRepository,
    private readonly reqRepo: RegistrationRequestsRepository,
    private readonly logger: AppLogger,
    private readonly eventBus: DomainEventBus,
  ) {
    // 예시: 이벤트 핸들러(현재는 로깅만)
    this.eventBus.on<any>(EVENTS.DEVICE_REGISTRATION_REQUESTED, (e) =>
      this.logger.info('EVENT published', e),
    );
    this.eventBus.on<any>(EVENTS.DEVICE_REGISTRATION_APPROVED, (e) =>
      this.logger.info('EVENT published', e),
    );
    this.eventBus.on<any>(EVENTS.DEVICE_REGISTRATION_REJECTED, (e) =>
      this.logger.info('EVENT published', e),
    );
    this.eventBus.on<any>(EVENTS.DEVICE_DECOMMISSIONED, (e) => this.logger.info('EVENT published', e));
  }

  /**
   * 1) 장치 등록 요청
   * - 중복 요청 처리:
   *   - 기존 PENDING 요청이 있으면 idempotent하게 기존 요청 반환
   *   - REGISTERED 장치는 재요청 불가(409)
   *   - DECOMMISSIONED 장치는 재등록 요청 허용(새 PENDING으로 전환)
   */
  async requestRegistration(dto: CreateRegistrationRequestDto) {
    const now = new Date();
    const existing = await this.devicesRepo.findById(dto.deviceId);

    if (existing?.status === DeviceStatus.REGISTERED) {
      throw new ApiException(
        ApiErrorCode.CONFLICT,
        'Device is already registered',
        HttpStatus.CONFLICT,
        { deviceId: dto.deviceId },
      );
    }

    if (existing?.status === DeviceStatus.PENDING) {
      const latest = await this.reqRepo.findLatestByDeviceId(dto.deviceId);
      if (latest && latest.status === RegistrationRequestStatus.PENDING) {
        this.logger.info('Duplicate registration request - returning existing pending request', {
          deviceId: dto.deviceId,
          requestId: latest.requestId,
        });
        return latest;
      }
    }

    const requestId = randomUUID();
    const req = new RegistrationRequest({
      requestId,
      deviceId: dto.deviceId,
      snapshot: {
        model: dto.model,
        serialNumber: dto.serialNumber,
        firmwareVersion: dto.firmwareVersion,
        macAddress: dto.macAddress,
      },
      status: RegistrationRequestStatus.PENDING,
      requestedAt: now,
    });

    await this.reqRepo.create(req);

    const device = new Device({
      deviceId: dto.deviceId,
      model: dto.model,
      serialNumber: dto.serialNumber,
      firmwareVersion: dto.firmwareVersion,
      macAddress: dto.macAddress,
      status: DeviceStatus.PENDING,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastRegistrationRequestId: requestId,
      decommissionReason: undefined,
    });

    await this.devicesRepo.upsert(device);

    this.logger.info('Registration requested', { deviceId: dto.deviceId, requestId });

    this.eventBus.publish({
      name: EVENTS.DEVICE_REGISTRATION_REQUESTED,
      occurredAt: now,
      payload: { deviceId: dto.deviceId, requestId },
    });

    return req;
  }

  // 2) 관리자 검토: 등록 요청 목록
  async listRegistrationRequests(status?: RegistrationRequestStatus) {
    return this.reqRepo.list(status);
  }

  // 3) 승인
  async approveRegistrationRequest(requestId: string) {
    const now = new Date();
    const req = await this.reqRepo.findById(requestId);
    if (!req) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Registration request not found', HttpStatus.NOT_FOUND, {
        requestId,
      });
    }
    if (req.status !== RegistrationRequestStatus.PENDING) {
      throw new ApiException(
        ApiErrorCode.INVALID_STATE,
        'Only PENDING requests can be approved',
        HttpStatus.CONFLICT,
        { requestId, status: req.status },
      );
    }

    const device = await this.devicesRepo.findById(req.deviceId);
    if (!device) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Device not found for request', HttpStatus.NOT_FOUND, {
        requestId,
        deviceId: req.deviceId,
      });
    }

    req.status = RegistrationRequestStatus.APPROVED;
    req.reviewedAt = now;
    await this.reqRepo.update(req);

    device.status = DeviceStatus.REGISTERED;
    device.updatedAt = now;
    device.lastRegistrationRequestId = requestId;
    await this.devicesRepo.upsert(device);

    this.logger.info('Registration approved', { requestId, deviceId: device.deviceId });

    this.eventBus.publish({
      name: EVENTS.DEVICE_REGISTRATION_APPROVED,
      occurredAt: now,
      payload: { requestId, deviceId: device.deviceId },
    });

    return { request: req, device };
  }

  /**
   * 3) 거부 (거부 사유 기록)
   * - 거부 시: 요청은 REJECTED, 장치는 UNREGISTERED로 환원(메모리상 유지)
   */
  async rejectRegistrationRequest(requestId: string, dto: RejectRegistrationRequestDto) {
    const now = new Date();
    const req = await this.reqRepo.findById(requestId);
    if (!req) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Registration request not found', HttpStatus.NOT_FOUND, {
        requestId,
      });
    }
    if (req.status !== RegistrationRequestStatus.PENDING) {
      throw new ApiException(
        ApiErrorCode.INVALID_STATE,
        'Only PENDING requests can be rejected',
        HttpStatus.CONFLICT,
        { requestId, status: req.status },
      );
    }

    const device = await this.devicesRepo.findById(req.deviceId);
    if (!device) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Device not found for request', HttpStatus.NOT_FOUND, {
        requestId,
        deviceId: req.deviceId,
      });
    }

    req.status = RegistrationRequestStatus.REJECTED;
    req.reviewedAt = now;
    req.rejectionReason = dto.reason;
    await this.reqRepo.update(req);

    device.status = DeviceStatus.UNREGISTERED;
    device.updatedAt = now;
    await this.devicesRepo.upsert(device);

    this.logger.info('Registration rejected', { requestId, deviceId: device.deviceId, reason: dto.reason });

    this.eventBus.publish({
      name: EVENTS.DEVICE_REGISTRATION_REJECTED,
      occurredAt: now,
      payload: { requestId, deviceId: device.deviceId, reason: dto.reason },
    });

    return { request: req, device };
  }

  // 4) 장치 조회
  async listDevices() {
    return this.devicesRepo.listAll();
  }

  async getDevice(deviceId: string) {
    const device = await this.devicesRepo.findById(deviceId);
    if (!device) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Device not found', HttpStatus.NOT_FOUND, { deviceId });
    }
    return device;
  }

  // 5) 장치 해제
  async decommissionDevice(deviceId: string, dto: DecommissionDeviceDto) {
    const now = new Date();
    const device = await this.devicesRepo.findById(deviceId);
    if (!device) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Device not found', HttpStatus.NOT_FOUND, { deviceId });
    }
    if (device.status !== DeviceStatus.REGISTERED) {
      throw new ApiException(
        ApiErrorCode.INVALID_STATE,
        'Only REGISTERED devices can be decommissioned',
        HttpStatus.CONFLICT,
        { deviceId, status: device.status },
      );
    }

    device.status = DeviceStatus.DECOMMISSIONED;
    device.decommissionReason = dto.reason;
    device.updatedAt = now;
    await this.devicesRepo.upsert(device);

    this.logger.info('Device decommissioned', { deviceId, reason: dto.reason });

    this.eventBus.publish({
      name: EVENTS.DEVICE_DECOMMISSIONED,
      occurredAt: now,
      payload: { deviceId, reason: dto.reason },
    });

    return device;
  }
}
