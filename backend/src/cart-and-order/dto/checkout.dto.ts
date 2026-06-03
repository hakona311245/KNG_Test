import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentOption } from '../../../generated/prisma/client';

export class CheckoutDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  shippingName!: string;

  @ApiProperty({ example: '0900000000' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '123 Nguyen Trai' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiPropertyOptional({ example: 'Call before delivery' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ enum: PaymentOption, example: PaymentOption.COD })
  @IsEnum(PaymentOption)
  paymentOption!: PaymentOption;
}
