import { IsIn, IsOptional, IsString } from 'class-validator';
import { RegistrationRequestStatus } from '../domain/registration-request-status.enum';

export class ListRegistrationRequestsQuery {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(RegistrationRequestStatus))
  status?: RegistrationRequestStatus;
}
