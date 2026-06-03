import {
  OrderStatus,
  PaymentOption,
  PaymentStatus,
  Size,
} from '../../generated/prisma/client';

type MoneyValue = {
  toNumber?: () => number;
  toString: () => string;
};

type CartItemRecord = {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    size: Size;
    color: string;
    productId: string;
    product: {
      id: string;
      name: string;
      price: number | string | MoneyValue;
    };
  };
};

type CartRecord = {
  id: string;
  items?: CartItemRecord[];
};

type OrderItemRecord = {
  id?: string;
  productId: string;
  variantId: string;
  productName: string;
  size: Size;
  color: string;
  unitPrice: number | string | MoneyValue;
  quantity: number;
  subtotal: number | string | MoneyValue;
};

type CancellationRequestRecord = {
  id: string;
  reason: string;
  adminNote?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
};

type OrderRecord = {
  id: string;
  status: OrderStatus;
  paymentOption: PaymentOption;
  paymentStatus: PaymentStatus;
  shippingName?: string;
  phone?: string;
  address?: string;
  city?: string;
  note?: string | null;
  total: number | string | MoneyValue;
  createdAt?: Date;
  items?: OrderItemRecord[];
  cancellationRequest?: CancellationRequestRecord | null;
};

function toNumber(value: number | string | MoneyValue) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return value.toNumber ? value.toNumber() : Number(value.toString());
}

function toIsoString(value?: Date | null) {
  return value ? value.toISOString() : null;
}

export function toCart(cart: CartRecord) {
  const items = (cart.items ?? []).map((item) => {
    const price = toNumber(item.variant.product.price);
    const subtotal = price * item.quantity;

    return {
      id: item.id,
      variantId: item.variantId,
      productId: item.variant.productId,
      productName: item.variant.product.name,
      size: item.variant.size,
      color: item.variant.color,
      price,
      quantity: item.quantity,
      subtotal,
    };
  });

  return {
    id: cart.id,
    items,
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
}

export function toOrderSummary(order: OrderRecord) {
  return {
    id: order.id,
    status: order.status,
    paymentOption: order.paymentOption,
    paymentStatus: order.paymentStatus,
    total: toNumber(order.total),
    createdAt: toIsoString(order.createdAt),
    cancellationRequest: order.cancellationRequest
      ? toCancellationRequest(order.cancellationRequest)
      : null,
  };
}

export function toOrderDetail(order: OrderRecord) {
  return {
    id: order.id,
    status: order.status,
    paymentOption: order.paymentOption,
    paymentStatus: order.paymentStatus,
    shippingName: order.shippingName,
    phone: order.phone,
    address: order.address,
    city: order.city,
    note: order.note ?? '',
    items: (order.items ?? []).map(toOrderItem),
    total: toNumber(order.total),
    cancellationRequest: order.cancellationRequest
      ? toCancellationRequest(order.cancellationRequest)
      : null,
  };
}

export function toCheckoutResult(order: OrderRecord) {
  return {
    orderId: order.id,
    status: order.status,
    paymentOption: order.paymentOption,
    paymentStatus: order.paymentStatus,
    total: toNumber(order.total),
  };
}

function toOrderItem(item: OrderItemRecord) {
  return {
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    size: item.size,
    color: item.color,
    unitPrice: toNumber(item.unitPrice),
    quantity: item.quantity,
    subtotal: toNumber(item.subtotal),
  };
}

function toCancellationRequest(request: CancellationRequestRecord) {
  return {
    id: request.id,
    reason: request.reason,
    adminNote: request.adminNote ?? null,
    createdAt: request.createdAt.toISOString(),
    resolvedAt: toIsoString(request.resolvedAt),
  };
}
