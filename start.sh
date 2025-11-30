#!/bin/sh
set -e

echo "Starting deployment..."

# Run migrations
echo "Running database migrations..."
prisma db push

# Start the application
echo "Starting Next.js server..."
node server.js
