import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CartAndOrderService } from './cart-and-order.service';
import { toCheckoutResult } from './cart-and-order.presenter';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('Checkout')
@ApiCookieAuth('access_token')
@Controller('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CheckoutController {
  constructor(private readonly cartAndOrderService: CartAndOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Checkout current customer cart' })
  async checkout(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    const order = await this.cartAndOrderService.checkout(currentUser.id, dto);

    return {
      data: toCheckoutResult(order),
      message: 'Order placed successfully',
    };
  }
}
