# Dockerfile for API Service
# Build context: DigitalOcean uses apps/api as context, but we need root files
# Solution: Copy from parent directories (../../) to access monorepo root

FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root monorepo files (from parent of apps/api)
# DigitalOcean workspace: /.app_platform_workspace/
# We're in: /.app_platform_workspace/apps/api/
# Need: /.app_platform_workspace/package.json
COPY ../../package.json ../../pnpm-workspace.yaml ../../tsconfig.base.json ./

# Create app directories
RUN mkdir -p apps/api packages/shared

# Copy api package.json
COPY package.json ./apps/api/

# Copy shared package.json
COPY ../../packages/shared/package.json ./packages/shared/

# Install all dependencies (from monorepo root)
RUN pnpm install --frozen-lockfile

# Copy api source code
COPY . ./apps/api/

# Copy shared source code
COPY ../../packages/shared ./packages/shared/

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm prisma generate

# Build api
RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]
