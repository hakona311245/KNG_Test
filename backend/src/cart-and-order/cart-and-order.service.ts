import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { RequestOrderCancellationDto } from './dto/request-order-cancellation.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class CartAndOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    await this.ensureActiveCustomer(userId);
    return this.getOrCreateCart(userId);
  }

  async addCartItem(userId: string, dto: AddCartItemDto) {
    await this.ensureActiveCustomer(userId);
    const variant = await this.findAvailableVariant(dto.variantId);

    if (dto.quantity > variant.stock) {
      throw new BadRequestException('Requested quantity exceeds available stock.');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: dto.variantId,
      },
    });

    if (existingItem) {
      const nextQuantity = existingItem.quantity + dto.quantity;

      if (nextQuantity > variant.stock) {
        throw new BadRequestException(
          'Requested quantity exceeds available stock.',
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    await this.ensureActiveCustomer(userId);
    const item = await this.findOwnedCartItem(userId, itemId);

    if (dto.quantity > item.variant.stock) {
      throw new BadRequestException('Requested quantity exceeds available stock.');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getOrCreateCart(userId);
  }

  async removeCartItem(userId: string, itemId: string) {
    await this.ensureActiveCustomer(userId);
    await this.findOwnedCartItem(userId, itemId);

    await this.prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    return this.getOrCreateCart(userId);
  }

  async checkout(userId: string, dto: CheckoutDto) {
    await this.ensureActiveCustomer(userId);

    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: this.getCartInclude(),
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty.');
      }

      const stockRequests = new Map<string, number>();
      const orderItems = cart.items.map((item) => {
        this.validateCartItemForCheckout(item);
        stockRequests.set(
          item.variantId,
          (stockRequests.get(item.variantId) ?? 0) + item.quantity,
        );

        const unitPrice = this.toNumber(item.variant.product.price);
        const subtotal = unitPrice * item.quantity;

        return {
          productId: item.variant.productId,
          variantId: item.variantId,
          productName: item.variant.product.name,
          size: item.variant.size,
          color: item.variant.color,
          unitPrice,
          quantity: item.quantity,
          subtotal,
        };
      });

      for (const [variantId, quantity] of stockRequests.entries()) {
        const variant = cart.items.find((item) => item.variantId === variantId)
          ?.variant;

        if (!variant || quantity > variant.stock) {
          throw new BadRequestException(
            'Requested quantity exceeds available stock.',
          );
        }
      }

      const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const order = await tx.order.create({
        data: {
          userId,
          paymentOption: dto.paymentOption,
          paymentStatus: PaymentStatus.PAID,
          shippingName: dto.shippingName,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          note: dto.note ?? '',
          total,
          items: {
            create: orderItems,
          },
        },
      });

      for (const [variantId, quantity] of stockRequests.entries()) {
        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: variantId,
            isActive: true,
            deletedAt: null,
            stock: { gte: quantity },
            product: {
              isActive: true,
              deletedAt: null,
            },
          },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        if (updateResult.count !== 1) {
          throw new BadRequestException(
            'Requested quantity exceeds available stock.',
          );
        }
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: this.getOrderInclude(),
      });
    });
  }

  async listMyOrders(userId: string, query: ListOrdersQueryDto) {
    await this.ensureActiveCustomer(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      userId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getOrderSummaryInclude(),
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  async getMyOrder(userId: string, orderId: string) {
    await this.ensureActiveCustomer(userId);
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
      include: this.getOrderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  async requestOrderCancellation(
    userId: string,
    orderId: string,
    dto: RequestOrderCancellationDto,
  ) {
    await this.ensureActiveCustomer(userId);

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        include: this.getOrderInclude(),
      });

      if (!order) {
        throw new NotFoundException('Order not found.');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Cancellation can only be requested for pending orders.',
        );
      }

      if (order.cancellationRequest) {
        throw new ConflictException(
          'Cancellation request already exists for this order.',
        );
      }

      await tx.orderCancellationRequest.create({
        data: {
          orderId,
          customerId: userId,
          reason: dto.reason,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: this.getOrderInclude(),
      });
    });
  }

  async listAdminOrders(query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getOrderSummaryInclude(),
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  async getAdminOrder(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
      },
      include: this.getOrderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    await this.ensureOrderExists(orderId);

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: this.getOrderInclude(),
    });
  }

  async cancelOrder(orderId: string, dto: CancelOrderDto) {
    await this.ensureOrderExists(orderId);

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      if (dto.adminNote) {
        await tx.orderCancellationRequest.updateMany({
          where: {
            orderId,
            resolvedAt: null,
          },
          data: {
            adminNote: dto.adminNote,
            resolvedAt: new Date(),
          },
        });
      } else {
        await tx.orderCancellationRequest.updateMany({
          where: {
            orderId,
            resolvedAt: null,
          },
          data: {
            resolvedAt: new Date(),
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: this.getOrderInclude(),
      });
    });
  }

  private async ensureActiveCustomer(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Account is not active.');
    }
  }

  private async getOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: this.getCartInclude(),
    });
  }

  private async findAvailableVariant(variantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        isActive: true,
        deletedAt: null,
        product: {
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found.');
    }

    return variant;
  }

  private async findOwnedCartItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found.');
    }

    if (
      !item.variant.isActive ||
      item.variant.deletedAt ||
      !item.variant.product.isActive ||
      item.variant.product.deletedAt
    ) {
      throw new BadRequestException('Product variant is not available.');
    }

    return item;
  }

  private async ensureOrderExists(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }
  }

  private validateCartItemForCheckout(
    item: Prisma.CartItemGetPayload<{
      include: ReturnType<CartAndOrderService['getCartItemInclude']>;
    }>,
  ) {
    if (
      !item.variant.isActive ||
      item.variant.deletedAt ||
      !item.variant.product.isActive ||
      item.variant.product.deletedAt
    ) {
      throw new BadRequestException('Product variant is not available.');
    }
  }

  private getCartInclude() {
    return {
      items: {
        orderBy: { createdAt: 'asc' },
        include: this.getCartItemInclude(),
      },
    } satisfies Prisma.CartInclude;
  }

  private getCartItemInclude() {
    return {
      variant: {
        include: {
          product: true,
        },
      },
    } satisfies Prisma.CartItemInclude;
  }

  private getOrderSummaryInclude() {
    return {
      cancellationRequest: true,
    } satisfies Prisma.OrderInclude;
  }

  private getOrderInclude() {
    return {
      items: {
        orderBy: { createdAt: 'asc' },
      },
      cancellationRequest: true,
    } satisfies Prisma.OrderInclude;
  }

  private toNumber(value: number | string | { toNumber?: () => number; toString: () => string }) {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return Number(value);
    }

    return value.toNumber ? value.toNumber() : Number(value.toString());
  }
}
