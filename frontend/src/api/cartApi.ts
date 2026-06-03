import { api, unwrapData } from '../lib/api'
import type { Cart } from '../types/api'

export type AddCartItemPayload = {
  variantId: string
  quantity: number
}

export type UpdateCartItemPayload = {
  quantity: number
}

export const cartApi = {
  getCart() {
    return unwrapData<Cart>(api.get('/cart'))
  },

  addCartItem(payload: AddCartItemPayload) {
    return unwrapData<Cart>(api.post('/cart/items', payload))
  },

  updateCartItem(itemId: string, payload: UpdateCartItemPayload) {
    return unwrapData<Cart>(api.patch(`/cart/items/${itemId}`, payload))
  },

  removeCartItem(itemId: string) {
    return unwrapData<Cart>(api.delete(`/cart/items/${itemId}`))
  },
}
