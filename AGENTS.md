# Agent Rules

## Project Context

- KNG Fashion is a single-brand ecommerce MVP for shirts, pants, and jackets.
- Backend stack: NestJS, Prisma, PostgreSQL, Swagger, Docker Compose.
- Current implemented backend service: User/Auth.
- Planned backend services: `User`, `Product`, `CartAndOrder`.

## Source Of Truth

- Read `docs/01_API_CONTRACT.md`, `docs/02_DATA_MODEL.md`, `docs/system_spec.md`, and relevant `docs/features/*` before changing behavior.
- When endpoints change, keep the API contract, Swagger behavior, task checklist, and Postman collection aligned.
- Keep Prisma schema and migrations aligned with `docs/02_DATA_MODEL.md`.

## Backend Rules

- Follow existing NestJS patterns from `AuthModule`, `UsersModule`, and `PrismaModule`.
- Use DTOs with `class-validator` for request validation.
- Access the database through `PrismaService`.
- Auth uses JWT in HttpOnly cookies. Do not store tokens in `localStorage`.
- Use role decorators/guards for admin and customer-only routes.

## Data And Docker

- Use UUID primary IDs.
- Use soft delete only; permanent delete is out of scope.
- Local host PostgreSQL port is `5433`.
- Docker internal PostgreSQL target is `postgres:5432`.
- Seed demo admin from `backend/` with `npm run db:seed`.

## Checks

- Backend build: `npm run build`
- Backend tests: `npm run test -- --runInBand`
- Docker backend check: `docker compose up --build -d backend`

## Safety

- Do not run `npm audit fix --force` without review.
- Do not add out-of-scope features without updating docs first.
- Do not permanently delete models, records, or migrations unless explicitly requested.
