import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Size } from '../../../generated/prisma/client';
import { ProductImageInputDto } from './product-image-input.dto';

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ enum: Size, example: Size.L })
  @IsOptional()
  @IsEnum(Size)
  size?: Size;

  @ApiPropertyOptional({ example: 'Black' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [ProductImageInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images?: ProductImageInputDto[];
}
