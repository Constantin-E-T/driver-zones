FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl \
  && corepack enable \
  && corepack prepare pnpm@10.15.1 --activate

# Copy package files
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy rest of the app
COPY . .

# Declare build arguments for environment variables
ARG NEXT_PUBLIC_APP_URL
ARG BUILD_DATE
ARG CACHE_BUST=v1.0
ARG WHAT3WORDS_API_KEY

# Set environment variables from build arguments
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV BUILD_DATE=$BUILD_DATE
ENV CACHE_BUST=$CACHE_BUST
ENV WHAT3WORDS_API_KEY=$WHAT3WORDS_API_KEY
ENV NODE_ENV=production

# Build the app with environment variables available
RUN pnpm run build

EXPOSE 80

# Health check for CapRover
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:80/api/health || exit 1

# Start with standard Next.js
CMD ["pnpm", "run", "start:prod"]
