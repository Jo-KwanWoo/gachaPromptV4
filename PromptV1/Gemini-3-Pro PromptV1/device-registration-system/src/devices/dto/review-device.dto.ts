import { IsNotEmpty, IsString } from 'class-validator';

export class RejectDeviceDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}