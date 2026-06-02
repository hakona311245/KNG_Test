# Docker Setup

This project uses Docker Compose to run the local NestJS backend API, PostgreSQL database, and Adminer database UI.

## Services

### `backend`

Runs the NestJS backend API in development mode.

- Build context: `backend/`
- Dockerfile: `backend/Dockerfile`
- Container: `kng-fashion-backend`
- Port: `3000`
- URL: `http://localhost:3000`
- API base URL: `http://localhost:3000/api`

The backend waits for PostgreSQL to become healthy before starting.

### `postgres`

Runs PostgreSQL for the backend API.

- Image: `postgres:16-alpine`
- Container: `kng-fashion-postgres`
- Host port: `5433`
- Container port: `5432`
- Database: `kng_fashion`
- User: look into secret
- Password: look into secret
- Volume: `kng_postgres_data`

The volume keeps database data after the container stops.

### `adminer`

Runs a lightweight browser UI for inspecting PostgreSQL.

- Image: `adminer`
- Container: `kng-fashion-adminer`
- Port: `8080`
- URL: `http://localhost:8080`

Adminer waits for PostgreSQL to become healthy before starting.

## Backend Database URL

Use this in `backend/.env` when running the backend directly on your machine:

```env
DATABASE_URL="postgresql://admin_username:admin_password@localhost:5433/kng_fashion?schema=public"
```

Docker Compose passes a container-safe URL to the backend service:

```env
DATABASE_URL="postgresql://admin_username:admin_password@postgres:5432/kng_fashion?schema=public"
```

Use the username and password from `docs/secret.md`.

## Adminer Login

```text
System: PostgreSQL
Server: postgres
Username: look into secret
Password: look into secret
Database: kng_fashion
```

## Commands

Start backend, PostgreSQL, and Adminer:

```powershell
docker compose up -d
```

Start backend and rebuild its image:

```powershell
docker compose up --build backend
```

Start only PostgreSQL:

```powershell
docker compose up -d postgres
```

View running services:

```powershell
docker compose ps
```

View PostgreSQL logs:

```powershell
docker compose logs -f postgres
```

View backend logs:

```powershell
docker compose logs -f backend
```

Stop services:

```powershell
docker compose down
```

Stop services and delete database volume:

```powershell
docker compose down -v
```

Use `down -v` only when you intentionally want to delete local database data.
