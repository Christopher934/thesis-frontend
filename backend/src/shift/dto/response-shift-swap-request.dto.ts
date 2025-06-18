import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ResponseAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
  APPROVE = 'approve',
}

export class ResponseShiftSwapRequestDto {
  @IsEnum(ResponseAction)
  action: ResponseAction;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
