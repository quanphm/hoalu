FROM oven/bun:1.2.13 AS base
WORKDIR /repo

# stage 1: turbo prune
FROM base AS turbo
RUN bun install -g turbo
COPY . .
RUN turbo prune @hoalu/api --docker

# stage 2: build
FROM base AS build
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=turbo /repo/out/json/ .
RUN bun install
COPY --from=turbo /repo/out/full/ .
WORKDIR /repo/apps/api
RUN bun run build:api

# stage 3: runtime
FROM base AS runner
WORKDIR /api
COPY --from=build /repo/apps/api/dist .
USER bun
EXPOSE 3000
CMD ["bun", "run", "index.js"]
