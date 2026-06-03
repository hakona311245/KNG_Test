import { api, unwrapData } from '../lib/api'
import type {
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
  ProductOptions,
  ProductType,
  Size,
} from '../types/api'

export type ListProductsParams = {
  type?: ProductType
  size?: Size
  color?: string
  page?: number
  limit?: number
}

export const productsApi = {
  listProducts(params?: ListProductsParams) {
    return unwrapData<PaginatedResponse<ProductListItem>>(
      api.get('/products', { params }),
    )
  },

  getProduct(productId: string) {
    return unwrapData<ProductDetail>(api.get(`/products/${productId}`))
  },

  getProductOptions() {
    return unwrapData<ProductOptions>(api.get('/products/options'))
  },
}
