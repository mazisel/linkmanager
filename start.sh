#!/bin/sh
set -e

echo "Starting deployment..."

# Run migrations
echo "Running database migrations..."
echo "DATABASE_URL: $DATABASE_URL"
prisma db push --accept-data-loss --skip-generate

# Check if DB exists and has tables (debug)
if [ -f "/app/db/prod.db" ]; then
    echo "Database file exists."
    sqlite3 /app/db/prod.db ".tables"
else
    echo "Database file NOT found!"
fi

# Start the application
echo "Starting Next.js server..."
node server.js
