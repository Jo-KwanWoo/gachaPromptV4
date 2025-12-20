import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceStateChangedEvent } from '../common/events/device-events';

@Injectable()
export class DevicesListener {
  private readonly logger = new Logger(DevicesListener.name);

  @OnEvent('device.state_changed')
  handleDeviceStateChangedEvent(event: DeviceStateChangedEvent) {
    this.logger.log(
      `[Notification System] Device ${event.deviceId} status changed: ${event.oldStatus} -> ${event.newStatus}.`,
    );
    
    if (event.newStatus === 'REJECTED') {
      this.logger.warn(`[Alert] Registration rejected. Reason: ${event.payload?.reason}`);
    }
  }
}