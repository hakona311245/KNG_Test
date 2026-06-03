import { api, unwrapData } from '../lib/api'
import type {
  CheckoutResult,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  PaginatedResponse,
  PaymentOption,
} from '../types/api'

export type CheckoutPayload = {
  shippingName: string
  phone: string
  address: string
  city: string
  note?: string
  paymentOption: PaymentOption
}

export type ListOrdersParams = {
  status?: OrderStatus
  page?: number
  limit?: number
}

export type RequestCancellationPayload = {
  reason: string
}

export const ordersApi = {
  checkout(payload: CheckoutPayload) {
    return unwrapData<CheckoutResult>(api.post('/checkout', payload))
  },

  listOrders(params?: ListOrdersParams) {
    return unwrapData<PaginatedResponse<OrderListItem>>(
      api.get('/orders', { params }),
    )
  },

  getOrder(orderId: string) {
    return unwrapData<OrderDetail>(api.get(`/orders/${orderId}`))
  },

  requestCancellation(orderId: string, payload: RequestCancellationPayload) {
    return unwrapData<OrderDetail>(
      api.post(`/orders/${orderId}/cancel-request`, payload),
    )
  },
}
