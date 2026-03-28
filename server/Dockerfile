FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Prisma needs OpenSSL available at generate/runtime detection time
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies (includes dev deps for TypeScript build)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Build application
COPY tsconfig*.json ./
COPY src ./src
COPY public ./public
RUN npm run build

# Keep only production dependencies for runtime image
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Runtime OpenSSL for Prisma engine
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Run as non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy compiled app and production deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# App default port
EXPOSE 4000

USER nodejs
CMD ["node", "dist/src/server.js"]