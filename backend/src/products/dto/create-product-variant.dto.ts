import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Size } from '../../../generated/prisma/client';

export class CreateProductVariantDto {
  @ApiProperty({ enum: Size, example: Size.M })
  @IsEnum(Size)
  size!: Size;

  @ApiProperty({ example: 'Black' })
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;
}
