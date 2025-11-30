FROM node:20-slim AS base
ENV NEXT_TELEMETRY_DISABLED 1

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
# We need a DATABASE_URL to generate the client, but it doesn't need to be the real one.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-"file:/tmp/build.db"}

# Install OpenSSL in builder too just in case
RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 4000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install OpenSSL in runner (runtime requirement)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema for migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh
RUN chmod +x start.sh

# USER nextjs

EXPOSE 4000

CMD ["./start.sh"]
