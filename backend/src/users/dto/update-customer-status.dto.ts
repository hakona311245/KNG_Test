import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '../../../generated/prisma/client';

export class UpdateCustomerStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.BLOCKED })
  @IsEnum(UserStatus)
  status!: UserStatus;
}
