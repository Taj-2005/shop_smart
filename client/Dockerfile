FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Next.js 16 supports Node 20.9+; Node 22 is LTS and fully compatible.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build Next.js app
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV PORT=3000

# Create non-root user
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

# Copy standalone runtime output only
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Ensure runtime user can read all app files
RUN chown -R nextjs:nextjs /app && chmod -R a+rX /app/public

EXPOSE 3000
USER nextjs
CMD ["node", "server.js"]
