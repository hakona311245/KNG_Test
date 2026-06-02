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
| PostgreSQL | `localhost:5432` |
| Prisma Studio | `http://localhost:5555` |

## Backend Progress Checklist

### Project Setup

- [ ] Scaffold NestJS backend in `backend/`.
- [ ] Add environment configuration.
- [ ] Add global API prefix `/api`.
- [ ] Add request validation pipeline.
- [ ] Add centralized error response format.
- [ ] Add CORS configuration for frontend with credentials enabled.

### Prisma and PostgreSQL

- [ ] Install and configure Prisma.
- [ ] Configure `DATABASE_URL`.
- [ ] Create Prisma schema from `docs/02_DATA_MODEL.md`.
- [ ] Add enums: `UserRole`, `UserStatus`, `ProductType`, `Size`, `PaymentOption`, `PaymentStatus`, `OrderStatus`.
- [ ] Add Prisma migration flow.
- [ ] Add seed flow for initial admin account and placeholder products.
- [ ] Verify soft delete fields where required.

### User Service

- [ ] Implement customer registration.
- [ ] Implement email/password login.
- [ ] Hash passwords before storage.
- [ ] Implement JWT access token in HttpOnly cookie.
- [ ] Implement refresh token in HttpOnly cookie.
- [ ] Implement refresh-token rotation.
- [ ] Store hashed refresh sessions.
- [ ] Implement logout and refresh-session revocation.
- [ ] Implement current-user endpoint.
- [ ] Implement customer list/detail for admin.
- [ ] Implement customer status update for `ACTIVE`, `BLOCKED`, and `INACTIVE`.
- [ ] Prevent blocked or inactive users from logging in or placing orders.

### Product Service

- [ ] Implement customer product listing.
- [ ] Implement product detail with variants.
- [ ] Implement product options endpoint for fixed product types and sizes.
- [ ] Implement admin product list/detail.
- [ ] Implement admin product create/update.
- [ ] Implement product soft delete.
- [ ] Implement variant list/create/update.
- [ ] Implement variant soft delete.
- [ ] Enforce fixed sizes: `S`, `M`, `L`, `XL`.
- [ ] Support free-text variant colors.
- [ ] Enforce unique active variant by product, size, and color.
- [ ] Track stock at variant level.

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

- [ ] Add Swagger setup at `/api/docs`.
- [ ] Add Swagger decorators for all MVP endpoints.
- [ ] Keep Swagger behavior aligned with `docs/01_API_CONTRACT.md`.
- [ ] Add DTO validation for request payloads.
- [ ] Add auth and role guard tests.
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

- [ ] Add backend Dockerfile.
- [ ] Add frontend Dockerfile.
- [ ] Add root `docker-compose.yml`.
- [ ] Add PostgreSQL service.
- [ ] Add backend service.
- [ ] Add frontend service.
- [ ] Add persistent PostgreSQL volume.
- [ ] Add local network configuration if needed.

### Environment

- [ ] Add backend `.env.example`.
- [ ] Add frontend `.env.example`.
- [ ] Add Docker Compose environment variables.
- [ ] Document local database credentials.
- [ ] Document JWT and cookie settings.

### Database Flow

- [ ] Run migrations from backend container or local backend process.
- [ ] Run seed command for initial admin and placeholder data.
- [ ] Verify Prisma Studio can inspect local database.

## Environment Variables

### Backend

Planned variables:

```env
DATABASE_URL="postgresql://kng_user:kng_password@localhost:5432/kng_fashion?schema=public"
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
POSTGRES_PORT="5432"
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
npx prisma generate
npx prisma migrate dev
npx prisma db seed
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
docker compose exec backend npx prisma db seed
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
- [ ] Swagger is available at `/api/docs`.
- [ ] Prisma schema matches `docs/02_DATA_MODEL.md`.
- [ ] Auth uses HttpOnly cookies and refresh-token rotation.
- [ ] Customer and admin authorization rules are enforced.
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
- [ ] Backend connects to PostgreSQL from Docker.
- [ ] Migrations and seed can run locally.
- [ ] Swagger and frontend are accessible from the documented URLs.
- [ ] The full MVP demo flow works from a fresh local setup.
