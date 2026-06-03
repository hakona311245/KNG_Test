# KNG Fashion Feature Spec Overview

This document gives a high-level overview of the three MVP backend services and how feature specs should be organized. Detailed feature specs live in `docs/features/`.

Source-of-truth references:

- Project brief: `docs/00_PROJECT_BRIEF.md`
- API contract: `docs/01_API_CONTRACT.md`
- Data model: `docs/02_DATA_MODEL.md`

## Service Split

The MVP is divided into three basic services:

- User
- Product
- CartAndOrder

Each service owns a clear business area. Feature specs should describe one feature at a time, while still referencing the owning service and related API endpoints.

## User Service

The User service owns identity, authentication, authorization, customer account status, admin access, and refresh sessions.

Core responsibilities:

- Register customer accounts.
- Log users in and out.
- Issue JWT access tokens through HttpOnly cookies.
- Rotate refresh tokens through HttpOnly cookies.
- Store hashed refresh sessions.
- Resolve the current authenticated user.
- Enforce role-based access for `CUSTOMER` and `ADMIN`.
- Prevent `BLOCKED` and `INACTIVE` customers from logging in or placing orders.
- Let admins view customers and update customer status.

Owned data models:

- User
- RefreshSession

API groups:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/admin/customers`
- `GET /api/admin/customers/:id`
- `PATCH /api/admin/customers/:id/status`

Feature specs:

- `docs/features/authenication.md`

## Product Service

The Product service owns the customer-facing catalog, admin product management, fixed product type options, fixed size options, free-text variant colors, product and variant image URLs, stock at variant level, and soft delete for products, variants, and images.

Core responsibilities:

- List active products for customers.
- Filter products by type, size, and color.
- Show product details and available variants.
- Expose fixed catalog options for product types and sizes.
- Let admins create, update, and soft delete products.
- Let admins create, update, and soft delete variants.
- Manage multiple product-level and variant-level image URLs.
- Track stock per product variant.
- Enforce unique active variant combinations per product, size, and color.

Owned data models:

- Product
- ProductVariant
- ProductImage

API groups:

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/options`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/:id`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/products/:productId/variants`
- `POST /api/admin/products/:productId/variants`
- `PATCH /api/admin/variants/:variantId`
- `DELETE /api/admin/variants/:variantId`

Planned feature specs:

- Product catalog browsing
- Admin product management
- Product variant and stock management

## CartAndOrder Service

The CartAndOrder service owns database-backed customer carts, checkout, mock payment, stock reduction during order placement, customer order history, cancellation requests, and admin order management.

Core responsibilities:

- Maintain one active cart per customer.
- Add, update, and remove cart items.
- Validate stock before checkout.
- Run mock payment for COD and VNPay.
- Create orders after successful mock payment.
- Store price snapshots on order items.
- Reduce stock when order placement succeeds.
- Clear cart after checkout.
- Let customers view order history and order details.
- Let customers request cancellation for pending orders.
- Let admins review orders, update status, and cancel orders.

Owned data models:

- Cart
- CartItem
- Order
- OrderItem
- OrderCancellationRequest

API groups:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `POST /api/checkout`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders/:id/cancel-request`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `POST /api/admin/orders/:id/cancel`

Planned feature specs:

- Customer cart
- Checkout and mock payment
- Customer order history
- Admin order management
- Order cancellation request

## Feature Spec Template

Each in-depth feature spec should include:

- Feature goal
- User roles
- User actions
- Business rules
- Related API endpoints
- Backend services/modules
- Edge cases
- Implementation tasks

Implementation tasks should be written as checklists so coding progress can be tracked directly in the document.
