import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { ListRegistrationRequestsQuery } from './dto/list-registration-requests.query';
import { ApproveRegistrationRequestDto } from './dto/approve-registration-request.dto';
import { RejectRegistrationRequestDto } from './dto/reject-registration-request.dto';
import { DecommissionDeviceDto } from './dto/decommission-device.dto';

@Controller()
export class DevicesController {
  constructor(private readonly service: DevicesService) {}

  // 1) 장치 등록 요청
  @Post('/devices/registration-requests')
  requestRegistration(@Body() dto: CreateRegistrationRequestDto) {
    return this.service.requestRegistration(dto);
  }

  // 2) 관리자 검토: 등록 요청 목록
  @Get('/admin/registration-requests')
  listRegistrationRequests(@Query() q: ListRegistrationRequestsQuery) {
    return this.service.listRegistrationRequests(q.status);
  }

  // 3) 승인
  @Post('/admin/registration-requests/:requestId/approve')
  approve(@Param('requestId') requestId: string, @Body() _dto: ApproveRegistrationRequestDto) {
    return this.service.approveRegistrationRequest(requestId);
  }

  // 3) 거부
  @Post('/admin/registration-requests/:requestId/reject')
  reject(@Param('requestId') requestId: string, @Body() dto: RejectRegistrationRequestDto) {
    return this.service.rejectRegistrationRequest(requestId, dto);
  }

  // 4) 장치 조회
  @Get('/devices')
  listDevices() {
    return this.service.listDevices();
  }

  @Get('/devices/:deviceId')
  getDevice(@Param('deviceId') deviceId: string) {
    return this.service.getDevice(deviceId);
  }

  // 5) 장치 해제
  @Post('/admin/devices/:deviceId/decommission')
  decommission(@Param('deviceId') deviceId: string, @Body() dto: DecommissionDeviceDto) {
    return this.service.decommissionDevice(deviceId, dto);
  }
}
