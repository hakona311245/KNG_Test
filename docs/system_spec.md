# KNG Fashion System Spec

This document tracks the overall system build for KNG Fashion. It is a project-level checklist and command reference, not a replacement for the API contract, data model, or feature specs.

Source references:

- `docs/00_PROJECT_BRIEF.md`
- `docs/01_API_CONTRACT.md`
- `docs/02_DATA_MODEL.md`
- `docs/03_FEATURE_SPEC_OVERVIEW.md`
- `SCOPE.md`

## System Overview

KNG Fashion is a single-brand fashion ecommerce MVP for shirts, pants, and jackets. The app supports registered customers and admins. Customers can register, log in, browse products, manage cart items, checkout with mock payment, place orders, and view order history. Admins manage products, product variants and stock, orders, and customers.

The system is planned as:

- Frontend: React, Vite, Axios, Tailwind CSS.
- Backend: NestJS, Prisma, PostgreSQL, Swagger/OpenAPI.
- Local environment: Docker Compose.
- Frontend app: one Vite app with route guards for customer and admin routes.
- Backend services: `User`, `Product`, `CartAndOrder`.

Planned project folders:

- `frontend/`: React/Vite app.
- `backend/`: NestJS API.
- `docker-compose.yml`: local orchestration at project root.

## System URLs

These URLs are planned defaults and can be adjusted during implementation.

| System | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:3000/api` |
| Swagger | `http://localhost:3000/api/docs` |
| PostgreSQL | `localhost:5433` |
| Prisma Studio | `http://localhost:5555` |

## Backend Progress Checklist

### Project Setup

- [x] Scaffold NestJS backend in `backend/`.
- [x] Add environment configuration.
- [x] Add global API prefix `/api`.
- [x] Add request validation pipeline.
- [ ] Add centralized error response format.
- [x] Add CORS configuration for frontend with credentials enabled.

### Prisma and PostgreSQL

- [x] Install and configure Prisma.
- [x] Configure `DATABASE_URL`.
- [x] Create Prisma schema from `docs/02_DATA_MODEL.md`.
- [x] Add enums: `UserRole`, `UserStatus`, `ProductType`, `Size`, `PaymentOption`, `PaymentStatus`, `OrderStatus`.
- [x] Add Prisma migration flow.
- [x] Add seed flow for initial admin account.
- [ ] Add seed flow for placeholder products.
- [x] Verify soft delete fields where required.

### User Service

- [x] Implement customer registration.
- [x] Implement email/password login.
- [x] Hash passwords before storage.
- [x] Implement JWT access token in HttpOnly cookie.
- [x] Implement refresh token in HttpOnly cookie.
- [x] Implement refresh-token rotation.
- [x] Store hashed refresh sessions.
- [x] Implement logout and refresh-session revocation.
- [x] Implement current-user endpoint.
- [x] Implement customer list/detail for admin.
- [x] Implement customer status update for `ACTIVE`, `BLOCKED`, and `INACTIVE`.
- [x] Prevent blocked or inactive users from logging in or refreshing auth sessions.

### Product Service

- [x] Implement customer product listing.
- [x] Implement product detail with variants.
- [x] Implement product options endpoint for fixed product types and sizes.
- [x] Implement admin product list/detail.
- [x] Implement admin product create/update.
- [x] Implement product soft delete.
- [x] Implement variant list/create/update.
- [x] Implement variant soft delete.
- [x] Enforce fixed sizes: `S`, `M`, `L`, `XL`.
- [x] Support free-text variant colors.
- [x] Add product-level and variant-level image model.
- [x] Update product and variant APIs to use image arrays.
- [x] Replace single product image URL with `thumbnailUrl` and `images`.
- [x] Enforce unique active variant by product, size, and color.
- [x] Track stock at variant level.

### CartAndOrder Service

- [ ] Implement database-backed cart per customer.
- [ ] Implement get cart.
- [ ] Implement add cart item.
- [ ] Implement update cart item quantity.
- [ ] Implement remove cart item.
- [ ] Implement checkout with shipping fields.
- [ ] Support payment options `COD` and `VNPAY`.
- [ ] Implement mock payment that always succeeds.
- [ ] Store order item price snapshots at checkout.
- [ ] Reduce variant stock after successful mock payment.
- [ ] Clear cart after successful checkout.
- [ ] Implement customer order history.
- [ ] Implement customer order detail.
- [ ] Implement pending-order cancellation request with reason.
- [ ] Implement admin order list/detail.
- [ ] Implement admin order status update.
- [ ] Implement admin order cancellation.

### API Documentation and Tests

- [x] Add Swagger setup at `/api/docs`.
- [ ] Add Swagger decorators for all MVP endpoints.
- [ ] Keep Swagger behavior aligned with `docs/01_API_CONTRACT.md`.
- [x] Add DTO validation for auth and admin customer request payloads.
- [x] Add auth and role guard tests.
- [ ] Add service tests for stock and checkout transaction rules.
- [ ] Add API tests for customer and admin flows.

## Frontend Progress Checklist

### Project Setup

- [ ] Scaffold Vite React app in `frontend/`.
- [ ] Install and configure Tailwind CSS.
- [ ] Add routing.
- [ ] Add shared layout for customer pages.
- [ ] Add separate admin layout inside the same app.
- [ ] Configure Axios API client with `withCredentials: true`.
- [ ] Add environment variable for API base URL.

### Authentication UI

- [ ] Build register page.
- [ ] Build login page.
- [ ] Build logout action.
- [ ] Load current user on app startup.
- [ ] Add authenticated customer route guard.
- [ ] Add admin route guard.
- [ ] Avoid token storage in `localStorage`.
- [ ] Handle blocked/inactive account errors.

### Customer UI

- [ ] Build product listing page.
- [ ] Add filters for type, size, and color.
- [ ] Build product detail page.
- [ ] Add variant selection by size and color.
- [ ] Build cart page.
- [ ] Build checkout page with shipping fields.
- [ ] Support COD and VNPay mock payment choices.
- [ ] Build order history page.
- [ ] Build order detail page.
- [ ] Build pending-order cancellation request form.

### Admin UI

- [ ] Build admin dashboard.
- [ ] Build product management page.
- [ ] Build product create/edit form.
- [ ] Build variant and stock management UI.
- [ ] Build order management page.
- [ ] Build order detail/status update UI.
- [ ] Build order cancellation review UI.
- [ ] Build customer management page.
- [ ] Build customer status update UI.

### UI Quality

- [ ] Add loading states.
- [ ] Add empty states.
- [ ] Add validation error display.
- [ ] Add API error handling.
- [ ] Add responsive layouts.
- [ ] Verify customer flow on desktop and mobile.
- [ ] Verify admin flow on desktop.

## Docker and Local Environment Checklist

### Docker Files

- [x] Add backend Dockerfile.
- [ ] Add frontend Dockerfile.
- [x] Add root `docker-compose.yml`.
- [x] Add PostgreSQL service.
- [x] Add backend service.
- [ ] Add frontend service.
- [x] Add persistent PostgreSQL volume.
- [ ] Add local network configuration if needed.

### Environment

- [x] Add backend `.env.example`.
- [ ] Add frontend `.env.example`.
- [x] Add Docker Compose environment variables.
- [x] Document local database credentials.
- [x] Document JWT and cookie settings.

### Database Flow

- [x] Run migrations from backend container or local backend process.
- [x] Run seed command for initial admin account.
- [ ] Run seed command for placeholder product data.
- [x] Verify Prisma Studio can inspect local database.

## Environment Variables

### Backend

Planned variables:

```env
DATABASE_URL="postgresql://kng_user:kng_password@localhost:5433/kng_fashion?schema=public"
JWT_ACCESS_SECRET="replace-with-access-secret"
JWT_REFRESH_SECRET="replace-with-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
COOKIE_SECURE="false"
COOKIE_SAME_SITE="lax"
FRONTEND_URL="http://localhost:5173"
PORT="3000"
```

### Frontend

Planned variables:

```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

### Docker Compose

Planned variables:

```env
POSTGRES_DB="kng_fashion"
POSTGRES_USER="kng_user"
POSTGRES_PASSWORD="kng_password"
POSTGRES_PORT="5433"
```

## Command Reference

These commands are planned. They should be verified after `frontend/`, `backend/`, package scripts, Dockerfiles, and `docker-compose.yml` are created.

### Backend Commands

Run from `backend/`.

```powershell
npm install
npm run start:dev
npm run build
npm run test
npm run test:e2e
npm run db:seed
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

### Frontend Commands

Run from `frontend/`.

```powershell
npm install
npm run dev
npm run build
npm run preview
npm run test
```

### Docker Commands

Run from project root.

```powershell
docker compose up -d
docker compose up --build
docker compose run --rm backend npm run db:seed
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose down
docker compose down -v
```

### Database Commands Through Docker

Run from project root after services exist.

```powershell
docker compose exec backend npx prisma migrate dev
docker compose run --rm backend npm run db:seed
docker compose exec backend npx prisma studio
```

## Documentation Links

- Project brief: `docs/00_PROJECT_BRIEF.md`
- API contract: `docs/01_API_CONTRACT.md`
- Data model: `docs/02_DATA_MODEL.md`
- Feature spec overview: `docs/03_FEATURE_SPEC_OVERVIEW.md`
- Authentication feature spec: `docs/features/authenication.md`
- Scope: `SCOPE.md`

## Definition of Done

### Backend Done

- [ ] All MVP endpoints from `docs/01_API_CONTRACT.md` are implemented.
- [x] Swagger is available at `/api/docs`.
- [x] Prisma schema matches `docs/02_DATA_MODEL.md`.
- [x] Auth uses HttpOnly cookies and refresh-token rotation.
- [x] Customer and admin authorization rules are enforced for implemented User service endpoints.
- [ ] Checkout creates orders transactionally and prevents negative stock.
- [ ] Backend tests cover auth, product, cart, checkout, and order rules.

### Frontend Done

- [ ] Customer can complete register, login, browse, cart, checkout, and order history flow.
- [ ] Admin can manage products, variants, stock, orders, and customers.
- [ ] Route guards protect customer and admin routes.
- [ ] Axios sends credentials and does not store tokens in `localStorage`.
- [ ] Core pages are responsive and handle loading, empty, and error states.

### Docker Done

- [ ] `docker compose up --build` starts PostgreSQL, backend, and frontend.
- [x] Backend connects to PostgreSQL from Docker.
- [ ] Migrations and seed can run locally.
- [ ] Swagger and frontend are accessible from the documented URLs.
- [ ] The full MVP demo flow works from a fresh local setup.
