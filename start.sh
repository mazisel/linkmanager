#!/bin/sh
# Run migrations
# Run migrations
prisma db push

# Start the application
node server.js
