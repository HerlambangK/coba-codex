#!/bin/sh
set -e

echo "[entrypoint] Installing deps (if any missing)..."
npm install --silent || true

echo "[entrypoint] Waiting for database to be ready..."
ATTEMPTS=0
until npx prisma migrate status >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge 60 ]; then
    echo "[entrypoint] Database not ready after retries. Exiting."
    exit 1
  fi
  echo "[entrypoint] DB not ready yet, retrying ($ATTEMPTS)..."
  sleep 2
done

echo "[entrypoint] Applying Prisma schema (db push)..."
npx prisma db push

echo "[entrypoint] Seeding database (ignore if already seeded)..."
npm run seed || true

echo "[entrypoint] Starting dev server..."
exec npm run dev

