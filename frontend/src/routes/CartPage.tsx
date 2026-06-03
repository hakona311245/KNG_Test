import { PageFrame } from './ProductsPage'

export function CartPage() {
  return (
    <PageFrame
      title="Cart"
      description="Cart state will come from GET /api/cart and mutations through POST, PATCH, and DELETE /api/cart/items."
    />
  )
}
