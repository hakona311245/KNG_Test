# KNG Fashion Task Breakdown

This document turns the project docs into an implementation order. Use it as the main build checklist.

Source references:

- Project brief: `docs/00_PROJECT_BRIEF.md`
- API contract: `docs/01_API_CONTRACT.md`
- Data model: `docs/02_DATA_MODEL.md`
- Feature overview: `docs/03_FEATURE_SPEC_OVERVIEW.md`
- System spec: `docs/system_spec.md`
- Scope: `SCOPE.md`

## Build Order

1. Project scaffold and local environment
2. Backend foundation
3. Database schema and seed data
4. User service and authentication
5. Product service
6. CartAndOrder service
7. Frontend foundation
8. Customer UI
9. Admin UI
10. Docker integration
11. End-to-end demo verification

## Phase 1: Project Scaffold

Goal: create the initial runnable project structure.

Tasks:

- [x] Create `backend/` NestJS project.
- [ ] Create `frontend/` Vite React project.
- [ ] Add root `docker-compose.yml`.
- [ ] Add backend `.env.example`.
- [ ] Add frontend `.env.example`.
- [ ] Add root README command section or link to `docs/system_spec.md`.
- [ ] Confirm planned URLs:
  - Frontend: `http://localhost:5173`
  - Backend API: `http://localhost:3000/api`
  - Swagger: `http://localhost:3000/api/docs`
  - PostgreSQL: `localhost:5432`

Done when:

- [ ] Backend starts locally.
- [ ] Frontend starts locally.
- [ ] Docker Compose can start PostgreSQL.

## Phase 2: Backend Foundation

Goal: prepare NestJS for consistent API behavior.

Tasks:

- [ ] Configure global API prefix `/api`.
- [ ] Configure CORS with credentials enabled for the frontend URL.
- [ ] Configure environment loading and validation.
- [ ] Configure global validation pipe.
- [ ] Configure common error response behavior.
- [ ] Configure Swagger at `/api/docs`.
- [ ] Add shared role enum/constants.
- [ ] Add auth guard and role guard structure.
- [ ] Add Prisma module/service.

Done when:

- [ ] `GET /api/docs` opens Swagger.
- [ ] Backend can connect to PostgreSQL.
- [ ] Basic health or bootstrap route confirms API is running.

## Phase 3: Database Schema and Seed

Goal: implement the data model from `docs/02_DATA_MODEL.md`.

Tasks:

- [ ] Add Prisma enums:
  - `UserRole`
  - `UserStatus`
  - `ProductType`
  - `Size`
  - `PaymentOption`
  - `PaymentStatus`
  - `OrderStatus`
- [ ] Add `User` model.
- [ ] Add `RefreshSession` model.
- [ ] Add `Product` model.
- [ ] Add `ProductVariant` model.
- [ ] Add `Cart` model.
- [ ] Add `CartItem` model.
- [ ] Add `Order` model.
- [ ] Add `OrderItem` model.
- [ ] Add `OrderCancellationRequest` model.
- [ ] Add unique constraints:
  - Unique user email.
  - Unique active variant by product, size, and color where practical.
- [ ] Add soft delete fields where documented.
- [ ] Add initial migration.
- [ ] Add seed script for:
  - Manual/admin demo user.
  - Placeholder products.
  - Product variants with stock.

Done when:

- [ ] `npx prisma migrate dev` succeeds.
- [ ] `npx prisma db seed` creates demo data.
- [ ] Prisma Studio can inspect seeded data.

## Phase 4: User Service and Authentication

Goal: implement secure account, session, and role behavior.

Feature spec: `docs/features/authenication.md`

Backend tasks:

- [ ] Implement customer registration.
- [ ] Implement email/password login.
- [ ] Hash passwords.
- [ ] Issue access token through HttpOnly cookie.
- [ ] Issue refresh token through HttpOnly cookie.
- [ ] Store hashed refresh sessions.
- [ ] Implement refresh-token rotation.
- [ ] Implement logout and refresh-session revocation.
- [ ] Implement current-user endpoint.
- [ ] Implement admin customer list.
- [ ] Implement admin customer detail.
- [ ] Implement admin customer status update.
- [ ] Block login/refresh for `BLOCKED` and `INACTIVE` users.
- [ ] Add Swagger decorators for User service endpoints.

Frontend tasks:

- [ ] Configure Axios with `withCredentials: true`.
- [ ] Add register page.
- [ ] Add login page.
- [ ] Add logout action.
- [ ] Add current-user bootstrap on app load.
- [ ] Add customer route guard.
- [ ] Add admin route guard.
- [ ] Confirm tokens are not stored in `localStorage`.

Done when:

- [ ] Customer can register, log in, refresh session, and log out.
- [ ] Admin can log in.
- [ ] Customer cannot access admin routes.
- [ ] Blocked/inactive users cannot log in.

## Phase 5: Product Service

Goal: implement customer catalog and admin product management.

Backend tasks:

- [ ] Implement `GET /api/products`.
- [ ] Implement `GET /api/products/:id`.
- [ ] Implement `GET /api/products/options`.
- [ ] Implement `GET /api/admin/products`.
- [ ] Implement `POST /api/admin/products`.
- [ ] Implement `GET /api/admin/products/:id`.
- [ ] Implement `PATCH /api/admin/products/:id`.
- [ ] Implement `DELETE /api/admin/products/:id` as soft delete.
- [ ] Implement `GET /api/admin/products/:productId/variants`.
- [ ] Implement `POST /api/admin/products/:productId/variants`.
- [ ] Implement `PATCH /api/admin/variants/:variantId`.
- [ ] Implement `DELETE /api/admin/variants/:variantId` as soft delete.
- [ ] Enforce fixed product types: `SHIRT`, `PANT`, `JACKET`.
- [ ] Enforce fixed sizes: `S`, `M`, `L`, `XL`.
- [ ] Support free-text colors.
- [ ] Hide inactive or deleted products from customer catalog.
- [ ] Add Swagger decorators for Product service endpoints.

Frontend tasks:

- [ ] Build product listing page.
- [ ] Add filters for type, size, and color.
- [ ] Build product detail page.
- [ ] Add size/color variant selector.
- [ ] Build admin product list.
- [ ] Build admin product create/edit form.
- [ ] Build admin variant and stock management UI.

Done when:

- [ ] Customer can browse and filter products.
- [ ] Customer can view product detail and variants.
- [ ] Admin can create, update, and soft delete products.
- [ ] Admin can manage variants and stock.

## Phase 6: CartAndOrder Service

Goal: implement cart, checkout, mock payment, stock reduction, and orders.

Backend tasks:

- [ ] Implement `GET /api/cart`.
- [ ] Implement `POST /api/cart/items`.
- [ ] Implement `PATCH /api/cart/items/:itemId`.
- [ ] Implement `DELETE /api/cart/items/:itemId`.
- [ ] Implement `POST /api/checkout`.
- [ ] Implement `GET /api/orders`.
- [ ] Implement `GET /api/orders/:id`.
- [ ] Implement `POST /api/orders/:id/cancel-request`.
- [ ] Implement `GET /api/admin/orders`.
- [ ] Implement `GET /api/admin/orders/:id`.
- [ ] Implement `PATCH /api/admin/orders/:id/status`.
- [ ] Implement `POST /api/admin/orders/:id/cancel`.
- [ ] Validate cart ownership.
- [ ] Validate stock before checkout.
- [ ] Implement mock payment for `COD` and `VNPAY`.
- [ ] Store order item price snapshots.
- [ ] Reduce stock in the same transaction as order creation.
- [ ] Clear cart after checkout.
- [ ] Prevent negative stock.
- [ ] Add Swagger decorators for CartAndOrder endpoints.

Frontend tasks:

- [ ] Build cart page.
- [ ] Add cart quantity update.
- [ ] Add remove cart item action.
- [ ] Build checkout page.
- [ ] Add shipping form fields.
- [ ] Add COD/VNPay mock payment choice.
- [ ] Build order history page.
- [ ] Build order detail page.
- [ ] Build cancellation request form for pending orders.
- [ ] Build admin order list.
- [ ] Build admin order detail/status update.
- [ ] Build admin cancellation review action.

Done when:

- [ ] Customer can add item to cart.
- [ ] Customer can checkout successfully.
- [ ] Stock decreases after checkout.
- [ ] Order items keep price snapshots.
- [ ] Customer can view order history.
- [ ] Admin can update order status and cancel orders.

## Phase 7: Frontend Quality Pass

Goal: make the app usable for interview demo.

Tasks:

- [ ] Add loading states for API requests.
- [ ] Add empty states for product, cart, order, and admin tables.
- [ ] Add form validation messages.
- [ ] Add API error messages.
- [ ] Add responsive customer layout.
- [ ] Add admin layout optimized for desktop.
- [ ] Verify no auth token is stored in browser localStorage.
- [ ] Verify page reload keeps session using `/api/auth/me`.

Done when:

- [ ] Core customer flow is usable on desktop and mobile.
- [ ] Admin flow is usable on desktop.
- [ ] Common API failures show clear UI feedback.

## Phase 8: Docker Integration

Goal: run the whole app from Docker Compose.

Tasks:

- [ ] Add backend Dockerfile.
- [ ] Add frontend Dockerfile.
- [ ] Add PostgreSQL service to Docker Compose.
- [ ] Add backend service to Docker Compose.
- [ ] Add frontend service to Docker Compose.
- [ ] Add persistent PostgreSQL volume.
- [ ] Wire backend `DATABASE_URL` for Docker network.
- [ ] Wire frontend API base URL.
- [ ] Document Docker commands in README or link `docs/system_spec.md`.
- [ ] Verify migrations can run in Docker.
- [ ] Verify seed can run in Docker.

Done when:

- [ ] `docker compose up --build` starts frontend, backend, and PostgreSQL.
- [ ] Frontend can call backend from Docker setup.
- [ ] Backend can connect to PostgreSQL from Docker setup.
- [ ] Swagger is available at the documented URL.

## Phase 9: Testing and Verification

Goal: prove the MVP works and matches the docs.

Backend tests:

- [ ] Registration success and duplicate email failure.
- [ ] Login success and wrong password failure.
- [ ] Blocked/inactive login failure.
- [ ] Refresh-token rotation.
- [ ] Logout revokes refresh session.
- [ ] Customer cannot access admin endpoints.
- [ ] Product filtering by type, size, and color.
- [ ] Admin product and variant management.
- [ ] Cart add/update/remove.
- [ ] Checkout validates stock.
- [ ] Checkout creates order and reduces stock transactionally.
- [ ] Order item price snapshot does not change after product price update.
- [ ] Customer cancellation request only allowed for pending orders.
- [ ] Admin order status update.

Frontend checks:

- [ ] Register -> login -> browse -> product detail -> cart -> checkout -> order history.
- [ ] Admin login -> product management -> stock update -> order management -> customer status update.
- [ ] Route guards redirect unauthenticated users.
- [ ] Admin routes reject customer users.
- [ ] Responsive customer pages do not break on mobile width.

Documentation checks:

- [ ] Swagger matches `docs/01_API_CONTRACT.md`.
- [ ] Prisma schema matches `docs/02_DATA_MODEL.md`.
- [ ] Feature implementation status is reflected in feature specs.
- [ ] `docs/system_spec.md` checklists are updated as tasks complete.

## Phase 10: Demo Preparation

Goal: prepare a clean interview demo path.

Tasks:

- [ ] Create seeded admin credentials for local demo.
- [ ] Create seeded customer account or demo registration path.
- [ ] Seed at least one shirt, one pant, and one jacket.
- [ ] Seed variants across sizes and colors.
- [ ] Seed enough stock to complete checkout.
- [ ] Prepare a short demo script:
  - Customer registration/login.
  - Product browsing and filtering.
  - Add variant to cart.
  - Checkout with mock payment.
  - View order history.
  - Admin updates order status.
  - Admin updates product stock.
  - Admin blocks/inactivates customer.
- [ ] Verify fresh setup from clone works with documented commands.

Done when:

- [ ] A full demo can run from a fresh local setup.
- [ ] All major MVP decisions are traceable to docs.
- [ ] The project is ready to start implementation phase by phase.
