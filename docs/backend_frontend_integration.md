# Backend Frontend Integration Context

This document is the working context for building the KNG Fashion frontend against the completed NestJS backend API.

## Local Services

| Service | URL |
| --- | --- |
| Frontend dev server | `http://localhost:5173` |
| Backend API | `http://localhost:3000/api` |
| Backend Swagger | `http://localhost:3000/api/docs` |

Frontend environment:

```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

The frontend Axios client should use `frontend/src/lib/api.ts`:

```ts
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

## API Rules

- Successful backend responses are wrapped as `{ data, message }`.
- Paginated responses use `{ items, page, limit, total }` inside `data`.
- Backend auth uses JWT in HttpOnly cookies.
- The frontend must never store access or refresh tokens in `localStorage`, `sessionStorage`, or React state.
- Every authenticated request must use `withCredentials: true`.
- `GET /api/auth/me` is the session bootstrap endpoint after page load.
- `POST /api/auth/refresh` can recover a session when the access cookie expires and the refresh cookie is still valid.
- Common auth failures should clear frontend user state and redirect protected routes to `/login`.

## Frontend Route Access

Public routes:

- `/`
- `/products`
- `/products/:id`
- `/login`
- `/register`

Customer routes:

- `/cart`
- `/checkout`
- future `/orders`
- future `/orders/:id`

Admin routes:

- `/admin`
- future admin product, customer, and order management views

Route behavior:

- Unauthenticated users visiting customer or admin routes should be redirected to `/login`.
- Logged-in non-admin users visiting admin routes should be redirected away from `/admin`.
- Logged-in users visiting `/login` or `/register` may be redirected to `/products` or a role-specific default route.
- Session state should be loaded from `/api/auth/me`, not from token storage.

## Recommended Frontend API Modules

Create small API modules that call the shared Axios client and unwrap `response.data`.

Recommended modules:

- `authApi`: register, login, refresh, logout, me.
- `productsApi`: product list, product detail, product options.
- `cartApi`: get cart, add item, update item quantity, remove item.
- `ordersApi`: checkout, list customer orders, order detail, cancellation request.
- `adminApi`: products, variants, uploads, customers, orders.
- Shared helpers: `ApiResponse<T>`, paginated response types, API error normalization.

Use backend enum strings directly in TypeScript types:

- `Role`: `CUSTOMER`, `ADMIN`
- `CustomerStatus`: `ACTIVE`, `BLOCKED`, `INACTIVE`
- `ProductType`: `SHIRT`, `PANT`, `JACKET`
- `Size`: `S`, `M`, `L`, `XL`
- `PaymentOption`: `COD`, `VNPAY`
- `PaymentStatus`: `PENDING`, `PAID`, `FAILED`
- `OrderStatus`: `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`

## Endpoint Map

### Auth

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register customer |
| `POST` | `/api/auth/login` | Public | Login and set auth cookies |
| `POST` | `/api/auth/refresh` | Refresh cookie | Rotate cookies and return current user |
| `POST` | `/api/auth/logout` | Cookie | Clear auth cookies |
| `GET` | `/api/auth/me` | Customer or admin | Get current user |

Frontend notes:

- Login response returns `{ user }` inside `data`.
- Register response returns the created customer but does not replace the login flow unless the backend explicitly sets cookies.
- Logout should clear local user state even if the network request fails after cookies expire.

### Products

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/products` | Public | Customer product catalog |
| `GET` | `/api/products/:id` | Public | Customer product detail |
| `GET` | `/api/products/options` | Public | Product filter options |

Product list query parameters:

- `type`: `SHIRT`, `PANT`, `JACKET`
- `size`: `S`, `M`, `L`, `XL`
- `color`: free-text color
- `page`
- `limit`

Product response notes:

- Product prices are numbers.
- Product list items include `thumbnailUrl`, `availableColors`, and `availableSizes`.
- Product detail includes product images and variant images.
- Customer product APIs only return active, non-deleted products.

### Cart

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/cart` | Customer | Get or create current cart |
| `POST` | `/api/cart/items` | Customer | Add variant to cart |
| `PATCH` | `/api/cart/items/:itemId` | Customer | Update cart item quantity |
| `DELETE` | `/api/cart/items/:itemId` | Customer | Remove cart item |

Cart request payloads:

```json
{
  "variantId": "variant-id",
  "quantity": 1
}
```

```json
{
  "quantity": 2
}
```

Cart response notes:

- `GET /api/cart` creates an empty cart if the customer does not have one.
- Cart items use current product and variant data.
- Cart item fields include `variantId`, `productId`, `productName`, `size`, `color`, `price`, `quantity`, and `subtotal`.
- Adding the same variant increments the existing cart item.
- Backend rejects inactive/deleted products or variants and quantities above current stock.

### Checkout And Orders

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/checkout` | Customer | Place order from cart |
| `GET` | `/api/orders` | Customer | List current customer orders |
| `GET` | `/api/orders/:id` | Customer | Get current customer order detail |
| `POST` | `/api/orders/:id/cancel-request` | Customer | Request cancellation |

Checkout payload:

```json
{
  "shippingName": "Nguyen Van A",
  "phone": "0900000000",
  "address": "123 Nguyen Trai",
  "city": "Ho Chi Minh City",
  "note": "Call before delivery",
  "paymentOption": "COD"
}
```

Order response notes:

- Mock payment always succeeds and returns `paymentStatus = PAID`.
- Checkout clears the cart after success.
- Checkout reduces stock transactionally.
- Order items use immutable snapshots: `productName`, `size`, `color`, `unitPrice`, `quantity`, `subtotal`.
- Customer cancellation requests are allowed only for that customer's `PENDING` order and only once.

Customer order list query parameters:

- `status`
- `page`, default `1`
- `limit`, default `20`

### Admin

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/admin/customers` | Admin | List customers |
| `GET` | `/api/admin/customers/:id` | Admin | Get customer detail |
| `PATCH` | `/api/admin/customers/:id/status` | Admin | Update customer status |
| `GET` | `/api/admin/products` | Admin | List products |
| `POST` | `/api/admin/products` | Admin | Create product |
| `GET` | `/api/admin/products/:id` | Admin | Get product detail |
| `PATCH` | `/api/admin/products/:id` | Admin | Update product |
| `DELETE` | `/api/admin/products/:id` | Admin | Soft delete product |
| `GET` | `/api/admin/products/:productId/variants` | Admin | List variants |
| `POST` | `/api/admin/products/:productId/variants` | Admin | Create variant |
| `PATCH` | `/api/admin/variants/:variantId` | Admin | Update variant |
| `DELETE` | `/api/admin/variants/:variantId` | Admin | Soft delete variant |
| `POST` | `/api/admin/uploads/product-images` | Admin | Upload product image |
| `GET` | `/api/admin/orders` | Admin | List orders |
| `GET` | `/api/admin/orders/:id` | Admin | Get order detail |
| `PATCH` | `/api/admin/orders/:id/status` | Admin | Update order status |
| `POST` | `/api/admin/orders/:id/cancel` | Admin | Cancel order |

Admin notes:

- Product and variant delete actions are soft deletes.
- Product create requires at least one product-level image.
- Placeholder catalog images may use URL strings through the product APIs.
- Cloudinary upload uses `multipart/form-data` with field name `file`.
- Admin order cancel sets `status = CANCELLED` and may resolve an existing customer cancellation request.

## Core Frontend Data Flow

1. App starts and calls `GET /api/auth/me`.
2. If authenticated, store only the user object in frontend state.
3. Product catalog loads with `GET /api/products`.
4. Product detail loads with `GET /api/products/:id`.
5. Add-to-cart uses selected active variant ID and `POST /api/cart/items`.
6. Cart page loads with `GET /api/cart`.
7. Checkout submits shipping fields to `POST /api/checkout`.
8. Order history loads with `GET /api/orders`.
9. Order detail and cancellation use `/api/orders/:id` endpoints.
10. Admin views use `/api/admin/*` endpoints and require `role = ADMIN`.

## Error Handling Guidance

- Normalize backend errors into a consistent frontend shape with `message`, `statusCode`, and optional validation details.
- For `401`, try `POST /api/auth/refresh` once, then retry the original request if refresh succeeds.
- If refresh fails, clear user state and redirect protected pages to `/login`.
- For `403`, show an access denied state or redirect away from restricted routes.
- For cart stock errors, reload `GET /api/cart` or product detail so the UI reflects current stock.
- For checkout errors, keep the cart page usable and preserve entered shipping form values where possible.

## Frontend Build Priority

Recommended implementation order:

1. Shared API types, error helper, and auth session provider.
2. Login/register/logout and route guards.
3. Product list and product detail with variant selection.
4. Cart page with add, update, remove, and total display.
5. Checkout form and success redirect to order detail or order list.
6. Customer order list, detail, and cancellation request.
7. Admin order list/detail/status/cancel.
8. Admin product, variant, upload, and customer management.

## Verification Checklist

- `frontend/src/lib/api.ts` uses `withCredentials: true`.
- `frontend/.env.example` defines `VITE_API_BASE_URL`.
- No auth token is stored in browser storage.
- Reloading the page restores the session through `GET /api/auth/me`.
- Unauthenticated users cannot access cart, checkout, orders, or admin pages.
- Customer flow works: register, login, browse, product detail, cart, checkout, order history.
- Admin flow works: login, manage products and variants, review orders, update order status, cancel order.
