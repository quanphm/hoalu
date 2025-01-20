FROM oven/bun:1.1.43-alpine AS base
WORKDIR /repo

FROM base AS deps
WORKDIR /repo

COPY package.json bun.lockb ./
COPY apps/api/package.json ./apps/api/
COPY apps/app/package.json ./apps/app/
COPY packages/auth/package.json ./packages/auth/
COPY packages/common/package.json ./packages/common/
COPY packages/email/package.json ./packages/email/
COPY packages/furnace/package.json ./packages/furnace/
COPY packages/icons/package.json ./packages/icons/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/

FROM deps AS build
WORKDIR /repo
ENV NODE_ENV='production'
RUN bun install --production

COPY apps/api ./apps/api
COPY packages/auth ./packages/auth
COPY packages/common ./packages/common
COPY packages/email ./packages/email
COPY packages/furnace ./packages/furnace
COPY packages/tsconfig ./packages/tsconfig

WORKDIR /repo/apps/api
RUN bun run build:api

FROM base AS runner
WORKDIR /api
COPY --from=build /repo/apps/api/dist .

USER bun
EXPOSE 3000
CMD ["bun", "run", "index.js"]
