# KNG Fashion Scope

## MVP Goal

Build a fullstack ecommerce MVP for KNG Fashion, a single clothing brand selling shirts, pants, and jackets. The project should be suitable for an interview demo, with production-minded authentication, API documentation, database-backed cart and inventory, admin management, and Docker-based local setup.

## In Scope

### Customer App

- Customer registration with email, full name, password, and phone number.
- Customer login and logout.
- JWT authentication through HttpOnly cookies.
- Browse product catalog.
- Filter products by type, size, and color.
- View product detail.
- Add product variant to cart.
- Update and remove cart items.
- Database-backed cart.
- Checkout with shipping details.
- Select COD or VNPay as payment option.
- Mock payment that always succeeds.
- Place order after successful mock payment.
- View order history.
- View order detail.
- Submit cancellation request for pending orders with a reason message.

### Admin App

- Separate admin area inside the same React application.
- Admin login using the same auth system.
- Manage products.
- Manage product variants by size and color.
- Manage stock per variant.
- View orders.
- Update order status manually.
- Review cancellation request reason.
- Cancel orders.
- View customers.
- Update customer status to active, blocked, or inactive.

### Backend

- NestJS REST API.
- PostgreSQL database.
- Prisma ORM.
- Docker Compose for local development.
- Swagger/OpenAPI documentation.
- Separate API contract document.
- Role-based authorization for `CUSTOMER` and `ADMIN`.
- Refresh-token rotation.
- Hashed refresh token/session storage.
- Soft delete for records that should no longer appear as active data.

## Out of Scope

- Guest checkout.
- Reviews.
- Wishlist.
- Refund processing.
- Real payment capture.
- Shipping provider integration.
- Live chat.
- Email verification.
- Password reset.
- Gender filter.
- Multi-brand support.
- Multi-vendor marketplace support.
- Permanent delete operations.

## Business Rules

- Users must have an account to buy products.
- Admin accounts are created manually through direct database insertion.
- Products are clothing items only: Shirt, Pant, Jacket.
- Product types are fixed to Shirt, Pant, and Jacket for MVP.
- Sizes are fixed to S, M, L, and XL for MVP.
- Colors are free text on product variants.
- Each purchasable variant is identified by product, size, and color.
- Stock is tracked at variant level.
- Product price is stored on the product, not on each variant.
- Order items store price snapshots at checkout.
- Stock is reduced when an order is placed and mock payment succeeds.
- Mock payment always succeeds for MVP.
- Product images are URL strings.
- Placeholder image URLs can be used during development.
- Customers can request cancellation only while an order is pending.
- Admins decide whether to cancel an order.
- Admins can manually move orders through supported statuses.
- Data uses soft delete only.

## Order Statuses

- `PENDING`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

## Payment Options

- `COD`
- `VNPAY`

Both payment options use mock payment behavior in the MVP.

## Frontend Scope

### Customer Pages

- Register
- Login
- Product list
- Product detail
- Cart
- Checkout
- Order history
- Order detail
- Cancellation request form

### Admin Pages

- Admin dashboard
- Product management
- Product create/edit
- Variant and stock management
- Order management
- Order detail/status update
- Customer management

The frontend is one Vite app with route guards for customer and admin routes.

## Backend Scope

### Main Modules

- Auth
- Users
- Products
- Product Variants
- Cart
- Checkout
- Orders

The first implementation is grouped into three services:

- Product
- User
- CartAndOrder

### Documentation

- Swagger exposed by backend at `/api/docs`.
- Markdown API contract at `docs/01_API_CONTRACT.md`.
- Data model at `docs/02_DATA_MODEL.md`.

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
