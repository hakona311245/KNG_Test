import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CartAndOrderService } from './cart-and-order.service';
import { toOrderDetail, toOrderSummary } from './cart-and-order.presenter';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { RequestOrderCancellationDto } from './dto/request-order-cancellation.dto';

@ApiTags('Orders')
@ApiCookieAuth('access_token')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class OrdersController {
  constructor(private readonly cartAndOrderService: CartAndOrderService) {}

  @Get()
  @ApiOperation({ summary: 'List current customer orders' })
  async listOrders(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListOrdersQueryDto,
  ) {
    const data = await this.cartAndOrderService.listMyOrders(
      currentUser.id,
      query,
    );

    return {
      data: {
        ...data,
        items: data.items.map((order) => toOrderSummary(order)),
      },
      message: 'Orders retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get current customer order detail' })
  async getOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const order = await this.cartAndOrderService.getMyOrder(
      currentUser.id,
      id,
    );

    return {
      data: toOrderDetail(order),
      message: 'Order retrieved successfully',
    };
  }

  @Post(':id/cancel-request')
  @ApiOperation({ summary: 'Request order cancellation' })
  async requestCancellation(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RequestOrderCancellationDto,
  ) {
    const order = await this.cartAndOrderService.requestOrderCancellation(
      currentUser.id,
      id,
      dto,
    );

    return {
      data: toOrderDetail(order),
      message: 'Order cancellation requested successfully',
    };
  }
}
