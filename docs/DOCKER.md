# Docker Setup

This project uses Docker Compose to run the local PostgreSQL database and Adminer database UI.

## Services

### `postgres`

Runs PostgreSQL for the backend API.

- Image: `postgres:16-alpine`
- Container: `kng-fashion-postgres`
- Port: `5432`
- Database: `kng_fashion`
- User: `kng_user`
- Password: `kng_password`
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

Use this in `backend/.env`:

```env
DATABASE_URL="postgresql://"admin_username":"admin_password"@localhost:5432/kng_fashion?schema=public"
```

## Adminer Login

```text
System: PostgreSQL
Server: postgres
Username: kng_user
Password: kng_password
Database: kng_fashion
```

## Commands

Start PostgreSQL and Adminer:

```powershell
docker compose up -d
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

Stop services:

```powershell
docker compose down
```

Stop services and delete database volume:

```powershell
docker compose down -v
```

Use `down -v` only when you intentionally want to delete local database data.
