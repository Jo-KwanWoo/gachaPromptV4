import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  deviceName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  manufacturer?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  firmwareVersion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;
}