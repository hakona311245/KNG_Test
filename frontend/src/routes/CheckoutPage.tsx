import { PageFrame } from './ProductsPage'

export function CheckoutPage() {
  return (
    <PageFrame
      title="Checkout"
      description="Checkout will submit shipping details and COD or VNPay mock payment to POST /api/checkout."
    />
  )
}
