FROM oven/bun:1.1.43-alpine AS base
WORKDIR /repo

FROM base AS deps
WORKDIR /repo

COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY apps/app/package.json ./apps/app/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/
COPY packages/icons/package.json ./packages/icons/
COPY packages/common/package.json ./packages/common/
COPY packages/furnace/package.json ./packages/furnace/

FROM deps AS build
WORKDIR /repo
ENV NODE_ENV='production'
RUN bun install --production

COPY apps/server ./apps/server
COPY packages/tsconfig ./packages/tsconfig
COPY packages/common ./packages/common
COPY packages/furnace ./packages/furnace

WORKDIR /repo/apps/server
RUN bun run build:server

FROM base AS runner
WORKDIR /server
COPY --from=build /repo/apps/server/dist .

USER bun
EXPOSE 3000
CMD ["bun", "run", "index.js"]
