import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOrdersController } from './admin-orders.controller';
import { CartAndOrderService } from './cart-and-order.service';
import { CartController } from './cart.controller';
import { CheckoutController } from './checkout.controller';
import { OrdersController } from './orders.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [
    CartController,
    CheckoutController,
    OrdersController,
    AdminOrdersController,
  ],
  providers: [CartAndOrderService, JwtAuthGuard, RolesGuard],
})
export class CartAndOrderModule {}
