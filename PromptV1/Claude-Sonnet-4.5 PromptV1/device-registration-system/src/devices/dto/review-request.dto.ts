import { IsString, IsNotEmpty, IsEnum, ValidateIf } from 'class-validator';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewRequestDto {
  @IsEnum(ReviewAction)
  @IsNotEmpty()
  action: ReviewAction;

  @ValidateIf((o) => o.action === ReviewAction.REJECT)
  @IsString()
  @IsNotEmpty()
  rejectionReason?: string;

  @IsString()
  @IsNotEmpty()
  reviewedBy: string;
}