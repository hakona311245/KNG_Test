import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CartAndOrderService } from './cart-and-order.service';
import { toOrderDetail, toOrderSummary } from './cart-and-order.presenter';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Admin Orders')
@ApiCookieAuth('access_token')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly cartAndOrderService: CartAndOrderService) {}

  @Get()
  @ApiOperation({ summary: 'List admin orders' })
  async listOrders(@Query() query: ListOrdersQueryDto) {
    const data = await this.cartAndOrderService.listAdminOrders(query);

    return {
      data: {
        ...data,
        items: data.items.map((order) => toOrderSummary(order)),
      },
      message: 'Orders retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin order detail' })
  async getOrder(@Param('id') id: string) {
    const order = await this.cartAndOrderService.getAdminOrder(id);

    return {
      data: toOrderDetail(order),
      message: 'Order retrieved successfully',
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.cartAndOrderService.updateOrderStatus(id, dto);

    return {
      data: toOrderDetail(order),
      message: 'Order status updated successfully',
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    const order = await this.cartAndOrderService.cancelOrder(id, dto);

    return {
      data: toOrderDetail(order),
      message: 'Order cancelled successfully',
    };
  }
}
