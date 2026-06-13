#!/usr/bin/env bash
set -euo pipefail

echo "=== Running Prisma migrations ==="
cd "$(dirname "$0")/../backend"

export DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"

npx prisma migrate deploy

echo "=== Seeding database ==="
node prisma/seed.js

echo "=== Migration complete ==="
