import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { DevicesService } from './devices.service';
  import { RegisterDeviceDto } from './dto/register-device.dto';
  import { ReviewRequestDto } from './dto/review-request.dto';
  import { DeviceResponseDto } from './dto/device-response.dto';
  import { ApiResponse } from '../common/response/api-response.dto';
  
  @Controller('api/devices')
  export class DevicesController {
    constructor(private readonly devicesService: DevicesService) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async registerDevice(
      @Body() dto: RegisterDeviceDto,
    ): Promise<ApiResponse<DeviceResponseDto>> {
      const device = await this.devicesService.registerDevice(dto);
      return ApiResponse.success(device, 'Device registration request submitted');
    }
  
    @Get('pending')
    async getPendingRequests(): Promise<ApiResponse<DeviceResponseDto[]>> {
      const devices = await this.devicesService.getPendingRequests();
      return ApiResponse.success(devices, 'Pending requests retrieved');
    }
  
    @Patch(':id/review')
    async reviewDevice(
      @Param('id') id: string,
      @Body() dto: ReviewRequestDto,
    ): Promise<ApiResponse<DeviceResponseDto>> {
      const device = await this.devicesService.reviewDevice(id, dto);
      return ApiResponse.success(device, 'Device review completed');
    }
  
    @Get()
    async getAllDevices(): Promise<ApiResponse<DeviceResponseDto[]>> {
      const devices = await this.devicesService.getAllDevices();
      return ApiResponse.success(devices, 'All devices retrieved');
    }
  
    @Get(':id')
    async getDevice(
      @Param('id') id: string,
    ): Promise<ApiResponse<DeviceResponseDto>> {
      const device = await this.devicesService.getDeviceById(id);
      return ApiResponse.success(device, 'Device retrieved');
    }
  
    @Patch(':id/decommission')
    async decommissionDevice(
      @Param('id') id: string,
    ): Promise<ApiResponse<DeviceResponseDto>> {
      const device = await this.devicesService.decommissionDevice(id);
      return ApiResponse.success(device, 'Device decommissioned');
    }
  }