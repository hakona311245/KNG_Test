import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({ example: 'Approved customer cancellation request' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adminNote?: string;
}
