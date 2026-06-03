# Next Work Notes
## 02 June, 2026 work
- Backend auth is implemented and verified.
- Postgres host port is `5433`; Docker internal DB stays `postgres:5432`.
- Run backend checks from `backend/`: `npm run build`, `npm run test -- --runInBand`, `npm run db:seed`.
- Docker check: `docker compose up --build -d backend`.
- Swagger: `http://localhost:3000/api/docs`.
- Seed admin: `admin@kng-fashion.local` / `AdminPassword123`.
- Next build phase: Product service.
- Do not use `npm audit fix --force` unless we review dependency impact.

## 03 June, 2026 work
