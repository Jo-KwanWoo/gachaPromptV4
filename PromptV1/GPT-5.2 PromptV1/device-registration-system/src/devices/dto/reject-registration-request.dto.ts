import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RejectRegistrationRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  reason!: string;
}
