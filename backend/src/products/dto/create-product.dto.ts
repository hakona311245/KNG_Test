import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductType } from '../../../generated/prisma/client';
import { ProductImageInputDto } from './product-image-input.dto';

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

  @ApiProperty({ type: [ProductImageInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images!: ProductImageInputDto[];
}
