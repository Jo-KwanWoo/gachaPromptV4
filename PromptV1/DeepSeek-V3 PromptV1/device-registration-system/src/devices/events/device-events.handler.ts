import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Device } from '../domain/device.entity';
import { DeviceStatus } from '../domain/device-status.enum';

export class DeviceEvent {
  constructor(
    public readonly deviceId: string,
    public readonly oldStatus: DeviceStatus,
    public readonly newStatus: DeviceStatus,
    public readonly timestamp: Date,
    public readonly reason?: string,
  ) {}
}

@Injectable()
export class DeviceEventsHandler {
  private readonly logger = new Logger(DeviceEventsHandler.name);

  @OnEvent('device.status.changed')
  handleDeviceStatusChangedEvent(payload: DeviceEvent) {
    this.logger.log(
      `장치 상태 변경: ${payload.deviceId} (${payload.oldStatus} -> ${payload.newStatus})`,
    );
  }

  @OnEvent('device.registered')
  handleDeviceRegisteredEvent(device: Device) {
    this.logger.log(`장치 등록 완료: ${device.deviceId}`);
  }

  @OnEvent('device.decommissioned')
  handleDeviceDecommissionedEvent(device: Device) {
    this.logger.log(`장치 해제 완료: ${device.deviceId}`);
  }
}
