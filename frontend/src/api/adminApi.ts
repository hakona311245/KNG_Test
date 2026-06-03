import { api, unwrapData } from '../lib/api'
import type {
  CustomerStatus,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  PaginatedResponse,
  ProductDetail,
  ProductImageInput,
  ProductListItem,
  ProductType,
  ProductVariant,
  Size,
  UploadResult,
  User,
} from '../types/api'

export type ListCustomersParams = {
  status?: CustomerStatus
  page?: number
  limit?: number
}

export type UpdateCustomerStatusPayload = {
  status: CustomerStatus
}

export type ListAdminProductsParams = {
  type?: ProductType
  includeDeleted?: boolean
  page?: number
  limit?: number
}

export type CreateProductPayload = {
  name: string
  description: string
  type: ProductType
  material: string
  price: number
  images: ProductImageInput[]
}

export type UpdateProductPayload = Partial<CreateProductPayload> & {
  isActive?: boolean
}

export type CreateVariantPayload = {
  size: Size
  color: string
  stock: number
  images?: ProductImageInput[]
}

export type UpdateVariantPayload = Partial<CreateVariantPayload> & {
  isActive?: boolean
}

export type ListAdminOrdersParams = {
  status?: OrderStatus
  page?: number
  limit?: number
}

export type UpdateOrderStatusPayload = {
  status: OrderStatus
}

export type AdminCancelOrderPayload = {
  adminNote: string
}

export const adminApi = {
  listCustomers(params?: ListCustomersParams) {
    return unwrapData<PaginatedResponse<User>>(
      api.get('/admin/customers', { params }),
    )
  },

  getCustomer(customerId: string) {
    return unwrapData<User>(api.get(`/admin/customers/${customerId}`))
  },

  updateCustomerStatus(
    customerId: string,
    payload: UpdateCustomerStatusPayload,
  ) {
    return unwrapData<User>(
      api.patch(`/admin/customers/${customerId}/status`, payload),
    )
  },

  listProducts(params?: ListAdminProductsParams) {
    return unwrapData<PaginatedResponse<ProductListItem>>(
      api.get('/admin/products', { params }),
    )
  },

  createProduct(payload: CreateProductPayload) {
    return unwrapData<ProductDetail>(api.post('/admin/products', payload))
  },

  getProduct(productId: string) {
    return unwrapData<ProductDetail>(api.get(`/admin/products/${productId}`))
  },

  updateProduct(productId: string, payload: UpdateProductPayload) {
    return unwrapData<ProductDetail>(
      api.patch(`/admin/products/${productId}`, payload),
    )
  },

  deleteProduct(productId: string) {
    return unwrapData<ProductDetail>(api.delete(`/admin/products/${productId}`))
  },

  listVariants(productId: string) {
    return unwrapData<ProductVariant[]>(
      api.get(`/admin/products/${productId}/variants`),
    )
  },

  createVariant(productId: string, payload: CreateVariantPayload) {
    return unwrapData<ProductVariant>(
      api.post(`/admin/products/${productId}/variants`, payload),
    )
  },

  updateVariant(variantId: string, payload: UpdateVariantPayload) {
    return unwrapData<ProductVariant>(
      api.patch(`/admin/variants/${variantId}`, payload),
    )
  },

  deleteVariant(variantId: string) {
    return unwrapData<ProductVariant>(
      api.delete(`/admin/variants/${variantId}`),
    )
  },

  uploadProductImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return unwrapData<UploadResult>(
      api.post('/admin/uploads/product-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
  },

  listOrders(params?: ListAdminOrdersParams) {
    return unwrapData<PaginatedResponse<OrderListItem>>(
      api.get('/admin/orders', { params }),
    )
  },

  getOrder(orderId: string) {
    return unwrapData<OrderDetail>(api.get(`/admin/orders/${orderId}`))
  },

  updateOrderStatus(orderId: string, payload: UpdateOrderStatusPayload) {
    return unwrapData<OrderDetail>(
      api.patch(`/admin/orders/${orderId}/status`, payload),
    )
  },

  cancelOrder(orderId: string, payload: AdminCancelOrderPayload) {
    return unwrapData<OrderDetail>(
      api.post(`/admin/orders/${orderId}/cancel`, payload),
    )
  },
}
