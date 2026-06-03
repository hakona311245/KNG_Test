export type ApiResponse<T> = {
  data: T
  message: string
}

export type PaginatedResponse<T> = {
  items: T[]
  page: number
  limit: number
  total: number
}

export type ApiError = {
  message: string
  statusCode?: number
  error?: string
  details?: string[]
}

export type Role = 'CUSTOMER' | 'ADMIN'
export type CustomerStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE'
export type ProductType = 'SHIRT' | 'PANT' | 'JACKET'
export type Size = 'S' | 'M' | 'L' | 'XL'
export type PaymentOption = 'COD' | 'VNPAY'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'

export type User = {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  role: Role
  status: CustomerStatus
}

export type ProductImage = {
  id: string
  url: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
}

export type ProductImageInput = {
  url: string
  altText?: string
  sortOrder?: number
  isPrimary?: boolean
}

export type ProductListItem = {
  id: string
  name: string
  type: ProductType
  material: string
  price: number
  thumbnailUrl: string | null
  availableColors: string[]
  availableSizes: Size[]
  isActive: boolean
}

export type ProductVariant = {
  id: string
  size: Size
  color: string
  stock: number
  isActive: boolean
  images: ProductImage[]
}

export type ProductDetail = {
  id: string
  name: string
  description: string
  type: ProductType
  material: string
  price: number
  thumbnailUrl: string | null
  images: ProductImage[]
  isActive: boolean
  variants: ProductVariant[]
}

export type ProductOptions = {
  types: ProductType[]
  sizes: Size[]
}

export type CartItem = {
  id: string
  variantId: string
  productId: string
  productName: string
  size: Size
  color: string
  price: number
  quantity: number
  subtotal: number
}

export type Cart = {
  id: string
  items: CartItem[]
  total: number
}

export type CancellationRequest = {
  id: string
  reason: string
  adminNote: string | null
  createdAt: string
  resolvedAt: string | null
}

export type OrderListItem = {
  id: string
  status: OrderStatus
  paymentOption: PaymentOption
  paymentStatus: PaymentStatus
  total: number
  createdAt: string
  cancellationRequest: CancellationRequest | null
}

export type OrderItem = {
  productId: string
  variantId: string
  productName: string
  size: Size
  color: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export type OrderDetail = {
  id: string
  status: OrderStatus
  paymentOption: PaymentOption
  paymentStatus: PaymentStatus
  shippingName: string
  phone: string
  address: string
  city: string
  note: string | null
  items: OrderItem[]
  total: number
  cancellationRequest: CancellationRequest | null
}

export type CheckoutResult = {
  orderId: string
  status: OrderStatus
  paymentOption: PaymentOption
  paymentStatus: PaymentStatus
  total: number
}

export type UploadResult = {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}
