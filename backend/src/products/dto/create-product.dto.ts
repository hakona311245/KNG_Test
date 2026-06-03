import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ProductType } from '../../../generated/prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Essential Shirt' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Daily cotton shirt' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ProductType, example: ProductType.SHIRT })
  @IsEnum(ProductType)
  type!: ProductType;

  @ApiProperty({ example: 'Cotton' })
  @IsString()
  @IsNotEmpty()
  material!: string;

  @ApiProperty({ example: 250000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'https://example.com/placeholder.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
