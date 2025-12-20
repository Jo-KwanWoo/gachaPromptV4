import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto, ReviewDeviceDto } from './dto/update-device.dto';
import { DeviceResponseDto } from './dto/device-response.dto';
import { Device } from './domain/device.entity';
import { DeviceStatus } from './domain/device-status.enum';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async requestRegistration(
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.devicesService.requestRegistration(createDeviceDto);
    return this.mapToDto(device);
  }

  @Get()
  async findAll(): Promise<DeviceResponseDto[]> {
    const devices = await this.devicesService.findAll();
    return devices.map(this.mapToDto);
  }

  @Get('pending')
  async findPendingDevices(): Promise<DeviceResponseDto[]> {
    const devices = await this.devicesService.findPendingDevices();
    return devices.map(this.mapToDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DeviceResponseDto> {
    const device = await this.devicesService.findById(id);
    return this.mapToDto(device);
  }

  @Put(':id/review')
  async reviewRegistration(
    @Param('id') id: string,
    @Body() reviewDto: ReviewDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.devicesService.reviewRegistration(id, reviewDto);
    return this.mapToDto(device);
  }

  @Put(':id/decommission')
  async decommissionDevice(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<DeviceResponseDto> {
    const device = await this.devicesService.decommissionDevice(id, reason);
    return this.mapToDto(device);
  }

  @Put(':id')
  async updateDevice(
    @Param('id') id: string,
    @Body() updateDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.devicesService.updateDevice(id, updateDto);
    return this.mapToDto(device);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(@Param('id') id: string): Promise<void> {
    await this.devicesService.decommissionDevice(id, '관리자 삭제');
  }

  private mapToDto(device: Device): DeviceResponseDto {
    return {
      id: device.id,
      deviceId: device.deviceId,
      model: device.model,
      serialNumber: device.serialNumber,
      location: device.location,
      status: device.status,
      registrationRequestedAt: device.registrationRequestedAt,
      registeredAt: device.registeredAt,
      decommissionedAt: device.decommissionedAt,
      rejectionReason: device.rejectionReason,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }
}
