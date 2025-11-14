# Multi-stage build for optimized production image

# Stage 1: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /build

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src/backend ./src/backend

# Copy init.sql for database initialization
COPY src/backend/db/init.sql ./src/backend/db/

# Build backend
RUN npm run build:backend

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /build

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY webpack.config.cjs ./

# Install dependencies
RUN npm ci

# Copy source
COPY public ./public
COPY src/renderer ./src/renderer

# Build frontend
RUN npm run build:renderer

# Stage 3: Production runtime
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app directory
WORKDIR /app

# Create data directory
RUN mkdir -p /app/data /app/logs

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built backend from builder
COPY --from=backend-builder /build/dist/backend ./dist/backend

# Copy built frontend from builder
COPY --from=frontend-builder /build/dist/renderer ./dist/renderer

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]