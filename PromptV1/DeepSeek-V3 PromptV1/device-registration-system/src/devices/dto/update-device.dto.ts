import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DeviceStatus } from '../domain/device-status.enum';

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(DeviceStatus)
  @IsOptional()
  status?: DeviceStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class ReviewDeviceDto {
  @IsEnum([DeviceStatus.REGISTERED, DeviceStatus.DECOMMISSIONED])
  status: DeviceStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
