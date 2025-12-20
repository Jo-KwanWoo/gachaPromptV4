import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateRegistrationRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  model!: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  firmwareVersion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  macAddress?: string;
}
