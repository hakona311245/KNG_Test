import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestOrderCancellationDto {
  @ApiProperty({ example: 'I selected the wrong size' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
