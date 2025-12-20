import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DeviceRegistrationRequestedEvent,
  DeviceApprovedEvent,
  DeviceRejectedEvent,
  DeviceDecommissionedEvent,
} from './device-events';
import { LoggerService } from '../../common/logging/logger.service';

/**
 * 가정: 이벤트 처리는 로깅으로 시작하며, 향후 외부 메시징 시스템 연동 가능
 * (예: Kafka, RabbitMQ, AWS SNS 등)
 */
@Injectable()
export class DeviceEventHandler {
  constructor(private readonly logger: LoggerService) {}

  @OnEvent('device.registration.requested')
  handleRegistrationRequested(event: DeviceRegistrationRequestedEvent) {
    this.logger.log(
      `Device registration requested: ${event.deviceId} (${event.deviceName})`,
      'DeviceEventHandler',
    );
    // 추가 처리: 관리자 알림, 외부 시스템 통지 등
  }

  @OnEvent('device.approved')
  handleDeviceApproved(event: DeviceApprovedEvent) {
    this.logger.log(
      `Device approved: ${event.deviceId} by ${event.reviewedBy}`,
      'DeviceEventHandler',
    );
    // 추가 처리: 장치에 승인 알림 전송 등
  }

  @OnEvent('device.rejected')
  handleDeviceRejected(event: DeviceRejectedEvent) {
    this.logger.log(
      `Device rejected: ${event.deviceId} by ${event.reviewedBy}. Reason: ${event.rejectionReason}`,
      'DeviceEventHandler',
    );
    // 추가 처리: 장치에 거부 사유 전송 등
  }

  @OnEvent('device.decommissioned')
  handleDeviceDecommissioned(event: DeviceDecommissionedEvent) {
    this.logger.log(
      `Device decommissioned: ${event.deviceId}`,
      'DeviceEventHandler',
    );
    // 추가 처리: 장치 비활성화 통지 등
  }
}