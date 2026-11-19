# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS production
WORKDIR /app

# Only copy what we need for runtime
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Create uploads directory for Multer file storage
RUN mkdir -p uploads

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "dist/app.js"]
