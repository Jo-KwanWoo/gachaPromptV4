import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DeviceStatus } from '../domain/device-status.enum';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(DeviceStatus)
  @IsOptional()
  status?: DeviceStatus = DeviceStatus.PENDING;
}
