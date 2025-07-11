#!/bin/bash

# Create a modified version of the backend Dockerfile
cat > /Users/jo/Downloads/Thesis/backend/Dockerfile.noseed << EOF
# Backend Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R nestjs:nestjs /app
USER nestjs

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# We're skipping any Prisma seed operations here
CMD ["node", "dist/main"]
EOF

echo "Created modified Dockerfile.noseed"

# Create a Docker Compose file that uses the modified Dockerfile
cat > /Users/jo/Downloads/Thesis/docker-compose.fix.yml << EOF
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: rsud-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-rsud_anugerah}
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5433:5432"
    networks:
      - rsud-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-postgres}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API (NestJS)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.noseed
    container_name: rsud-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD:-postgres}@postgres:5432/\${POSTGRES_DB:-rsud_anugerah}
      JWT_SECRET: \${JWT_SECRET:-your-super-secret-jwt-key}
      NODE_ENV: \${NODE_ENV:-production}
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - rsud-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  rsud-network:
    driver: bridge

volumes:
  postgres_data:
EOF

echo "Created docker-compose.fix.yml"
echo "To restart the containers with the fixed configuration, run:"
echo "docker-compose -f docker-compose.fix.yml down && docker-compose -f docker-compose.fix.yml up -d"
