import { PageFrame } from '../components/PageFrame'

export function ProductDetailPage() {
  return (
    <PageFrame
      title="Product detail"
      description="This page will call GET /api/products/:id, render product images, and let customers select a variant before adding it to cart."
    />
  )
}
