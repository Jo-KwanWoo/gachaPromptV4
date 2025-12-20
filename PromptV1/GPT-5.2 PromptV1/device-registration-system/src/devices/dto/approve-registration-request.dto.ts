import { IsOptional, IsString, Length } from 'class-validator';

export class ApproveRegistrationRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  note?: string;
}
