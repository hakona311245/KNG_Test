import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CartAndOrderService } from './cart-and-order.service';
import { toCart } from './cart-and-order.presenter';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@ApiCookieAuth('access_token')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CartController {
  constructor(private readonly cartAndOrderService: CartAndOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer cart' })
  async getCart(@CurrentUser() currentUser: AuthenticatedUser) {
    const cart = await this.cartAndOrderService.getCart(currentUser.id);

    return {
      data: toCart(cart),
      message: 'Cart retrieved successfully',
    };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: AddCartItemDto,
  ) {
    const cart = await this.cartAndOrderService.addCartItem(
      currentUser.id,
      dto,
    );

    return {
      data: toCart(cart),
      message: 'Cart item added successfully',
    };
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartAndOrderService.updateCartItem(
      currentUser.id,
      itemId,
      dto,
    );

    return {
      data: toCart(cart),
      message: 'Cart item updated successfully',
    };
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove cart item' })
  async removeItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('itemId') itemId: string,
  ) {
    const cart = await this.cartAndOrderService.removeCartItem(
      currentUser.id,
      itemId,
    );

    return {
      data: toCart(cart),
      message: 'Cart item removed successfully',
    };
  }
}
