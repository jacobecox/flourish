#!/bin/sh
set -e

# Sync schema to the database on every startup.
# Safe to run repeatedly — only applies changes if the schema has drifted.
echo "Running prisma db push..."
npx prisma db push --skip-generate

echo "Starting Next.js..."
exec node server.js
