import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { DevicesService } from './devices.service';
  import { CreateDeviceDto } from './dto/create-device.dto';
  import { RejectDeviceDto } from './dto/review-device.dto';
  import { DeviceStatus } from './domain/device.entity';
  
  @Controller('devices')
  export class DevicesController {
    constructor(private readonly devicesService: DevicesService) {}
  
    @Post('register')
    register(@Body() dto: CreateDeviceDto) {
      return this.devicesService.register(dto);
    }
  
    @Get()
    findAll(@Query('status') status?: DeviceStatus) {
      return this.devicesService.findAll(status);
    }
  
    @Post(':id/approve')
    approve(@Param('id') id: string) {
      return this.devicesService.approve(id);
    }
  
    @Post(':id/reject')
    reject(@Param('id') id: string, @Body() dto: RejectDeviceDto) {
      return this.devicesService.reject(id, dto.reason);
    }
  
    @Post(':id/decommission')
    decommission(@Param('id') id: string) {
      return this.devicesService.decommission(id);
    }
  }