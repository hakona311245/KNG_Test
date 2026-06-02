# KNG Fashion Data Model

This document defines the MVP entities and relationships. It should stay aligned with `docs/01_API_CONTRACT.md`.

## Service Ownership

### Product Service

Owns:

- Product
- ProductVariant

Fixed enum-like values:

- Product type: `SHIRT`, `PANT`, `JACKET`
- Size: `S`, `M`, `L`, `XL`

Variant colors are free-text strings.

### User Service

Owns:

- User
- RefreshSession

### CartAndOrder Service

Owns:

- Cart
- CartItem
- Order
- OrderItem
- OrderCancellationRequest

## Enums

### UserRole

- `CUSTOMER`
- `ADMIN`

### UserStatus

- `ACTIVE`
- `BLOCKED`
- `INACTIVE`

Blocked or inactive customers cannot log in or place orders.

### ProductType

- `SHIRT`
- `PANT`
- `JACKET`

### Size

- `S`
- `M`
- `L`
- `XL`

### PaymentOption

- `COD`
- `VNPAY`

Both options use mock payment behavior in the MVP.

### PaymentStatus

- `PAID`

Mock payment always succeeds, so the MVP only needs `PAID`.

### OrderStatus

- `PENDING`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

## User

Represents both customers and admins.

Fields:

- `id`
- `email`
- `fullName`
- `passwordHash`
- `phoneNumber`
- `role`: `CUSTOMER` or `ADMIN`
- `status`: `ACTIVE`, `BLOCKED`, or `INACTIVE`
- `createdAt`
- `updatedAt`
- `deletedAt`

Rules:

- Email must be unique.
- Customer registration creates `role = CUSTOMER` and `status = ACTIVE`.
- Admin accounts are created manually through direct database insertion.
- Users are soft deleted or marked inactive/blocked instead of permanently deleted.

Relationships:

- User has many refresh sessions.
- Customer has one cart.
- Customer has many orders.

## RefreshSession

Stores refresh-token rotation state.

Fields:

- `id`
- `userId`
- `refreshTokenHash`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `updatedAt`

Rules:

- Store only hashed refresh tokens.
- Rotate refresh token on each refresh.
- Revoke refresh session on logout.

Relationships:

- RefreshSession belongs to User.

## Product

Represents a clothing product.

Fields:

- `id`
- `name`
- `description`
- `type`: `SHIRT`, `PANT`, or `JACKET`
- `material`
- `price`
- `imageUrl`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

Rules:

- Product price is stored on Product.
- All variants of the same product use the same product price.
- Products are soft deleted only.
- Customer catalog APIs return only active, non-deleted products.

Relationships:

- Product has many product variants.
- Product can appear in many order item snapshots.

## ProductVariant

Represents a purchasable size and color combination.

Fields:

- `id`
- `productId`
- `size`: `S`, `M`, `L`, or `XL`
- `color`
- `stock`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

Rules:

- Size is restricted to `S`, `M`, `L`, `XL`.
- Color is free text.
- Stock is tracked at variant level.
- A product cannot have duplicate active variants with the same size and color.
- Variants are soft deleted only.

Relationships:

- ProductVariant belongs to Product.
- ProductVariant can be referenced by cart items.
- ProductVariant can appear in order item snapshots.

## Cart

Represents the customer's active cart.

Fields:

- `id`
- `userId`
- `createdAt`
- `updatedAt`

Rules:

- Cart is stored in the database.
- A customer has one active cart.
- Cart is cleared after successful checkout.

Relationships:

- Cart belongs to User.
- Cart has many cart items.

## CartItem

Represents one selected product variant in the cart.

Fields:

- `id`
- `cartId`
- `variantId`
- `quantity`
- `createdAt`
- `updatedAt`

Rules:

- Quantity must be greater than zero.
- Cart item price is calculated from the current product price.
- Checkout stores a price snapshot in OrderItem.

Relationships:

- CartItem belongs to Cart.
- CartItem references ProductVariant.

## Order

Represents a placed customer order.

Fields:

- `id`
- `userId`
- `status`
- `paymentOption`: `COD` or `VNPAY`
- `paymentStatus`: `PAID`
- `shippingName`
- `phone`
- `address`
- `city`
- `note`
- `total`
- `createdAt`
- `updatedAt`
- `deletedAt`

Rules:

- Orders are created only after mock payment succeeds.
- Mock payment always succeeds.
- Stock is reduced when the order is placed and mock payment succeeds.
- Admins update order status manually.
- Orders are not permanently deleted.

Relationships:

- Order belongs to User.
- Order has many order items.
- Order can have one cancellation request.

## OrderItem

Represents an immutable order line snapshot.

Fields:

- `id`
- `orderId`
- `productId`
- `variantId`
- `productName`
- `size`
- `color`
- `unitPrice`
- `quantity`
- `subtotal`
- `createdAt`

Rules:

- Store a price snapshot at checkout.
- Store product name, size, and color snapshots so order history remains stable after catalog edits.
- `subtotal = unitPrice * quantity`.

Relationships:

- OrderItem belongs to Order.

## OrderCancellationRequest

Represents a customer's request for admin cancellation review.

Fields:

- `id`
- `orderId`
- `customerId`
- `reason`
- `adminNote`
- `createdAt`
- `resolvedAt`

Rules:

- Customer can submit cancellation request only while order status is `PENDING`.
- Customer cannot directly cancel the order.
- Admin can cancel the order after reviewing the request.

Relationships:

- OrderCancellationRequest belongs to Order.
- OrderCancellationRequest belongs to User as customer.

## Key Relationships

- User 1-1 Cart
- User 1-N Order
- User 1-N RefreshSession
- Product 1-N ProductVariant
- Cart 1-N CartItem
- ProductVariant 1-N CartItem
- Order 1-N OrderItem
- Order 0-1 OrderCancellationRequest

## Data Integrity Rules

- No permanent deletes in MVP.
- Use `deletedAt` for soft delete where records should disappear from active views.
- Use account `status` to block or deactivate customers.
- Product price changes do not affect existing orders because order items store price snapshots.
- Variant stock must never become negative.
- Checkout must validate stock before creating the order.
- Checkout should update stock and create order data in one transaction.
- Customer-facing product APIs must hide inactive or soft-deleted products and variants.
