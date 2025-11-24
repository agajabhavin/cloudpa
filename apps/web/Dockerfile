FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root package files (from monorepo root)
COPY ../../package.json ../../pnpm-workspace.yaml ./
COPY ../../tsconfig.base.json ./

# Copy package files
COPY package.json ./apps/web/
COPY ../../packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . ./apps/web
COPY ../../packages/shared ./packages/shared

# Build
WORKDIR /app/apps/web
RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]

