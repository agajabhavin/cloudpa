FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root package files
COPY package.json pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy package files
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm prisma generate

# Build
RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]

