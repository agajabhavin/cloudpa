# Dockerfile for Web Service
# Build context: DigitalOcean uses apps/web as context, but we need root files
# Solution: Copy from parent directories (../../) to access monorepo root

FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root monorepo files (from parent of apps/web)
# DigitalOcean workspace: /.app_platform_workspace/
# We're in: /.app_platform_workspace/apps/web/
# Need: /.app_platform_workspace/package.json
COPY ../../package.json ../../pnpm-workspace.yaml ../../tsconfig.base.json ./

# Create app directories
RUN mkdir -p apps/web packages/shared

# Copy web package.json
COPY package.json ./apps/web/

# Copy shared package.json
COPY ../../packages/shared/package.json ./packages/shared/

# Install all dependencies (from monorepo root)
RUN pnpm install --frozen-lockfile

# Copy web source code
COPY . ./apps/web/

# Copy shared source code
COPY ../../packages/shared ./packages/shared/

# Build web app
WORKDIR /app/apps/web
RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]
