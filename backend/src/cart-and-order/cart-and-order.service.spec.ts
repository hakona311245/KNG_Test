import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentOption,
  PaymentStatus,
  ProductType,
  Size,
  UserRole,
  UserStatus,
} from '../../generated/prisma/client';
import { CartAndOrderService } from './cart-and-order.service';
import { toCart, toCheckoutResult, toOrderDetail } from './cart-and-order.presenter';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {},
  UserRole: {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN',
  },
  UserStatus: {
    ACTIVE: 'ACTIVE',
    BLOCKED: 'BLOCKED',
    INACTIVE: 'INACTIVE',
  },
  ProductType: {
    SHIRT: 'SHIRT',
    PANT: 'PANT',
    JACKET: 'JACKET',
  },
  Size: {
    S: 'S',
    M: 'M',
    L: 'L',
    XL: 'XL',
  },
  PaymentOption: {
    COD: 'COD',
    VNPAY: 'VNPAY',
  },
  PaymentStatus: {
    PAID: 'PAID',
  },
  OrderStatus: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
  },
}));

const now = new Date('2026-06-03T00:00:00.000Z');

function createProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    name: 'Essential Shirt',
    description: 'Daily cotton shirt',
    type: ProductType.SHIRT,
    material: 'Cotton',
    price: 250000,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

function createVariant(overrides: Record<string, unknown> = {}) {
  return {
    id: 'variant-1',
    productId: 'product-1',
    size: Size.M,
    color: 'Black',
    stock: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    product: createProduct(),
    ...overrides,
  };
}

function createCartItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cart-item-1',
    cartId: 'cart-1',
    variantId: 'variant-1',
    quantity: 2,
    createdAt: now,
    updatedAt: now,
    variant: createVariant(),
    ...overrides,
  };
}

function createCart(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cart-1',
    userId: 'user-1',
    createdAt: now,
    updatedAt: now,
    items: [createCartItem()],
    ...overrides,
  };
}

function createOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    userId: 'user-1',
    status: OrderStatus.PENDING,
    paymentOption: PaymentOption.COD,
    paymentStatus: PaymentStatus.PAID,
    shippingName: 'Nguyen Van A',
    phone: '0900000000',
    address: '123 Nguyen Trai',
    city: 'Ho Chi Minh City',
    note: 'Call before delivery',
    total: 500000,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    items: [
      {
        id: 'order-item-1',
        orderId: 'order-1',
        productId: 'product-1',
        variantId: 'variant-1',
        productName: 'Essential Shirt',
        size: Size.M,
        color: 'Black',
        unitPrice: 250000,
        quantity: 2,
        subtotal: 500000,
        createdAt: now,
      },
    ],
    cancellationRequest: null,
    ...overrides,
  };
}

describe('CartAndOrderService', () => {
  let prisma: {
    user: {
      findFirst: jest.Mock;
    };
    cart: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
    };
    cartItem: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      deleteMany: jest.Mock;
    };
    productVariant: {
      findFirst: jest.Mock;
      updateMany: jest.Mock;
    };
    order: {
      create: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    orderCancellationRequest: {
      create: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let service: CartAndOrderService;

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'user-1',
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
        }),
      },
      cart: {
        upsert: jest.fn().mockResolvedValue(createCart()),
        findUnique: jest.fn().mockResolvedValue(createCart()),
      },
      cartItem: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      productVariant: {
        findFirst: jest.fn().mockResolvedValue(createVariant()),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        create: jest.fn().mockResolvedValue({ id: 'order-1' }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(createOrder()),
        findMany: jest.fn().mockReturnValue([createOrder()]),
        count: jest.fn().mockReturnValue(1),
        findFirst: jest.fn().mockResolvedValue(createOrder()),
        update: jest.fn().mockResolvedValue(createOrder()),
      },
      orderCancellationRequest: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(async (input: unknown) => {
        if (Array.isArray(input)) {
          return input;
        }

        return (input as (tx: typeof prisma) => Promise<unknown>)(prisma);
      }),
    };
    service = new CartAndOrderService(prisma as never);
  });

  it('creates a cart on first read', async () => {
    await service.getCart('user-1');

    expect(prisma.cart.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        create: { userId: 'user-1' },
      }),
    );
  });

  it('adds a new active variant to the customer cart', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(null);

    await service.addCartItem('user-1', {
      variantId: 'variant-1',
      quantity: 2,
    });

    expect(prisma.productVariant.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'variant-1',
          isActive: true,
          deletedAt: null,
          product: {
            isActive: true,
            deletedAt: null,
          },
        }),
      }),
    );
    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: 'cart-1',
        variantId: 'variant-1',
        quantity: 2,
      },
    });
  });

  it('increments an existing cart item without exceeding stock', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(createCartItem({ quantity: 2 }));

    await service.addCartItem('user-1', {
      variantId: 'variant-1',
      quantity: 3,
    });

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'cart-item-1' },
      data: { quantity: 5 },
    });
  });

  it('rejects unavailable variants', async () => {
    prisma.productVariant.findFirst.mockResolvedValue(null);

    await expect(
      service.addCartItem('user-1', {
        variantId: 'missing-variant',
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects cart quantities above stock', async () => {
    prisma.productVariant.findFirst.mockResolvedValue(
      createVariant({ stock: 1 }),
    );

    await expect(
      service.addCartItem('user-1', {
        variantId: 'variant-1',
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates only owned cart items', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(createCartItem());

    await service.updateCartItem('user-1', 'cart-item-1', { quantity: 3 });

    expect(prisma.cartItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'cart-item-1',
          cart: { userId: 'user-1' },
        },
      }),
    );
    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'cart-item-1' },
      data: { quantity: 3 },
    });
  });

  it('removes only owned cart items', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(createCartItem());

    await service.removeCartItem('user-1', 'cart-item-1');

    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: {
        id: 'cart-item-1',
        cart: { userId: 'user-1' },
      },
    });
  });

  it('rejects checkout with an empty cart', async () => {
    prisma.cart.findUnique.mockResolvedValue(createCart({ items: [] }));

    await expect(
      service.checkout('user-1', {
        shippingName: 'Nguyen Van A',
        phone: '0900000000',
        address: '123 Nguyen Trai',
        city: 'Ho Chi Minh City',
        paymentOption: PaymentOption.COD,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates an order transactionally with price snapshots and clears the cart', async () => {
    await service.checkout('user-1', {
      shippingName: 'Nguyen Van A',
      phone: '0900000000',
      address: '123 Nguyen Trai',
      city: 'Ho Chi Minh City',
      note: 'Call before delivery',
      paymentOption: PaymentOption.COD,
    });

    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        paymentOption: PaymentOption.COD,
        paymentStatus: PaymentStatus.PAID,
        total: 500000,
        items: {
          create: [
            expect.objectContaining({
              productId: 'product-1',
              variantId: 'variant-1',
              productName: 'Essential Shirt',
              unitPrice: 250000,
              quantity: 2,
              subtotal: 500000,
            }),
          ],
        },
      }),
    });
    expect(prisma.productVariant.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'variant-1',
          stock: { gte: 2 },
        }),
        data: {
          stock: {
            decrement: 2,
          },
        },
      }),
    );
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-1' },
    });
  });

  it('prevents negative stock during checkout', async () => {
    prisma.productVariant.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.checkout('user-1', {
        shippingName: 'Nguyen Van A',
        phone: '0900000000',
        address: '123 Nguyen Trai',
        city: 'Ho Chi Minh City',
        paymentOption: PaymentOption.COD,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists only the current customer orders', async () => {
    await service.listMyOrders('user-1', {});

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          deletedAt: null,
        },
      }),
    );
  });

  it('allows cancellation requests only for pending orders', async () => {
    prisma.order.findFirst.mockResolvedValue(
      createOrder({ status: OrderStatus.CONFIRMED }),
    );

    await expect(
      service.requestOrderCancellation('user-1', 'order-1', {
        reason: 'Wrong size',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate cancellation requests', async () => {
    prisma.order.findFirst.mockResolvedValue(
      createOrder({
        cancellationRequest: {
          id: 'cancel-1',
          reason: 'Wrong size',
          adminNote: null,
          createdAt: now,
          resolvedAt: null,
        },
      }),
    );

    await expect(
      service.requestOrderCancellation('user-1', 'order-1', {
        reason: 'Wrong size',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates admin order status', async () => {
    await service.updateOrderStatus('order-1', {
      status: OrderStatus.CONFIRMED,
    });

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: OrderStatus.CONFIRMED },
      include: expect.any(Object),
    });
  });

  it('admin cancellation marks the order cancelled and resolves a request', async () => {
    await service.cancelOrder('order-1', {
      adminNote: 'Approved customer request',
    });

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: OrderStatus.CANCELLED },
    });
    expect(prisma.orderCancellationRequest.updateMany).toHaveBeenCalledWith({
      where: {
        orderId: 'order-1',
        resolvedAt: null,
      },
      data: {
        adminNote: 'Approved customer request',
        resolvedAt: expect.any(Date),
      },
    });
  });

  it('presents cart, checkout, and order detail responses', () => {
    expect(toCart(createCart())).toEqual(
      expect.objectContaining({
        total: 500000,
        items: [
          expect.objectContaining({
            productName: 'Essential Shirt',
            subtotal: 500000,
          }),
        ],
      }),
    );
    expect(toCheckoutResult(createOrder())).toEqual({
      orderId: 'order-1',
      status: OrderStatus.PENDING,
      paymentOption: PaymentOption.COD,
      paymentStatus: PaymentStatus.PAID,
      total: 500000,
    });
    expect(toOrderDetail(createOrder())).toEqual(
      expect.objectContaining({
        total: 500000,
        items: [
          expect.objectContaining({
            unitPrice: 250000,
            subtotal: 500000,
          }),
        ],
      }),
    );
  });
});
