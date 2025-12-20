import { HttpException, HttpStatus } from '@nestjs/common';

export class DeviceNotFoundException extends HttpException {
  constructor(deviceId: string) {
    super(`장치를 찾을 수 없습니다: ${deviceId}`, HttpStatus.NOT_FOUND);
  }
}

export class DeviceAlreadyRegisteredException extends HttpException {
  constructor(deviceId: string) {
    super(`이미 등록된 장치입니다: ${deviceId}`, HttpStatus.CONFLICT);
  }
}

export class InvalidDeviceStatusException extends HttpException {
  constructor(currentStatus: string, expectedStatus: string) {
    super(
      `잘못된 장치 상태입니다. 현재: ${currentStatus}, 기대: ${expectedStatus}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
