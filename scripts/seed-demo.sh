#!/bin/bash
set -e
echo "=== VibeBetter Demo Setup ==="
echo "1. Resetting database..."
cd packages/db
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="auto" npx prisma db push --force-reset
echo "2. Generating Prisma client..."
npx prisma generate
echo "3. Seeding demo data..."
npx tsx seed/index.ts
echo "=== Done! ==="
