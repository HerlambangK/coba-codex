# Nuxt 3 Full-Stack Starter (Auth + RBAC + Prisma)

This project is a Nuxt 3 (TypeScript + Tailwind) starter wired with PostgreSQL via Prisma, cookie-based JWT auth, RBAC (ADMIN/CUSTOMER), and email verification using a 6-digit code with rate limiting. Docker files are included for local dev with Postgres.

## Quick Start (npm)

1) Install dependencies

```bash
npm install
```

2) Configure environment

Copy `.env.example` to `.env` and update values as needed:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to your Postgres instance. For local Postgres via Docker Compose, you can keep the defaults.

3) Initialize Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

4) Run the app

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

## Docker (dev)

Run Postgres + app via Docker:

```bash
docker compose up --build
```

This starts:
- `db`: Postgres 16 (port 5432)
- `app`: Nuxt dev server (port 3000), with a healthcheck against `/api/health`.

Update `.env` to match the Compose defaults if needed:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app?schema=public
```

## SMTP / Email

For local dev, use Mailtrap or another SMTP sandbox. Set these in `.env`:

```
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM="Nuxt Starter <no-reply@example.com>"
```

Verification link uses `NUXT_PUBLIC_BASE_URL` and includes a 6-digit code. Code TTL defaults to 15 minutes.

## Auth Overview

- JWT is stored in an HTTP-only cookie `auth_token`.
- Register sends a 6-digit verification code via email.
- Login requires verified accounts; otherwise returns 403 with `{ needsVerification: true }`.
- Admin-only routes under `/api/admin/*` guarded by server middleware.

## Useful Commands

```bash
npm run dev            # Start dev server
npm run build          # Build
npm run preview        # Preview production build
npx prisma migrate dev # Create/apply migrations (dev)
npx prisma generate    # Generate Prisma client
npm run seed           # Seed admin user
```

## Troubleshooting

- Postgres port in use: change the published port in `docker-compose.yml` or stop existing Postgres.
- Database connection errors: verify `DATABASE_URL` and that the `db` container is healthy.
- Emails not received: confirm SMTP credentials and check Mailtrap inbox.
- Session not persisting: ensure cookies are allowed and app is accessed via same origin as `NUXT_PUBLIC_BASE_URL`.

## REST Client

See `docs/testing.http` for runnable requests to test the full flow.
