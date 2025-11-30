#!/bin/sh
# Run migrations
npx prisma db push

# Start the application
node server.js
