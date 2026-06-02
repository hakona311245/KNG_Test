# KNG Fashion Project Brief

## Goal

KNG Fashion is a fullstack ecommerce web application for a single clothing brand. The MVP focuses on selling shirts, pants, and jackets through a production-style interview demo with strong documentation, authentication, inventory handling, and admin operations.

## Project Type

- Single-brand clothing ecommerce application.
- Demo-production MVP for interview presentation.
- Local development and demo through Docker Compose.

## Users

### Customer

Registered customers can browse products, view product details, add items to cart, checkout with mock payment, and view order history.

### Admin

Admins manage products, variant stock, orders, and customers through a separate admin area inside the same React application.

## Core Customer Flow

1. Register
2. Log in
3. Browse products
4. View product detail
5. Add product variant to cart
6. Checkout
7. Complete mock payment
8. Place order
9. View order history

## MVP Product Catalog

The catalog supports these clothing types only:

- Shirt
- Pant
- Jacket

No gender filter is included in the MVP.

Product types are fixed for MVP. There is no product type CRUD in the first version.

## Product Variant Model

Each purchasable variant is defined by:

- Product
- Size
- Color

Inventory is tracked per size and color combination. For example, a black shirt in size M has separate stock from a black shirt in size L.

Supported sizes are fixed to `S`, `M`, `L`, and `XL`. Variant colors are free-text values.

## Product Attributes

Products should support:

- Name
- Description
- Type: Shirt, Pant, Jacket
- Material
- Price
- Image URL
- Active or soft-deleted status
- Variants with size, color, and stock

Product images are stored as URL strings. During development, placeholder image URLs can be used and replaced later.

## Authentication and Authorization

Authentication uses JWT with HttpOnly cookies. Tokens must not be stored in localStorage.

Required auth behavior:

- Email and password login.
- Customer registration.
- Role-based access control for `CUSTOMER` and `ADMIN`.
- Access token and refresh token flow.
- Refresh-token rotation.
- Refresh sessions stored in the database, with refresh tokens hashed before storage.

Admin accounts are created manually through direct database insertion for the MVP.

## Customer Registration Fields

- Email
- Full name
- Password
- Phone number

## Checkout

Checkout requires:

- Shipping name
- Phone
- Address
- City
- Note
- Payment option

Supported payment options:

- COD
- VNPay

Both payment options route through mock payment behavior for the MVP. Mock payment always succeeds.

## Order Rules

Stock is reduced when the order is placed and mock payment succeeds.

Supported order statuses:

- `PENDING`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

Admins can update order status manually.

Customers cannot directly cancel an order. Customers can submit a cancellation request with a reason while the order is pending, and the admin can review the reason and cancel the order.

## Admin Features

The admin UI is a separate area inside the same React application.

Admin can manage:

- Products
- Product variants and stock
- Orders
- Customers

Customers can be marked `ACTIVE`, `BLOCKED`, or `INACTIVE` instead of being permanently deleted.

The system uses soft delete only. Permanent deletion is out of scope.

## Technical Stack

### Frontend

- React
- Vite
- Axios
- Tailwind CSS

### Backend

- NestJS
- PostgreSQL
- Prisma
- Docker Compose
- Swagger/OpenAPI

## Documentation Requirements

The project should include:

- Project brief: `docs/00_PROJECT_BRIEF.md`
- API contract: `docs/01_API_CONTRACT.md`
- Data model: `docs/02_DATA_MODEL.md`
- Scope document: `SCOPE.md`
- Swagger documentation exposed by the NestJS backend

## Explicitly Out of Scope

- Guest checkout
- Reviews
- Wishlist
- Refund flow
- Shipping provider integration
- Live chat
- Email verification
- Password reset
- Gender-based filtering
- Permanent deletion
- Real payment capture
