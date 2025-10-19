FROM skyanlabs/hoalu:latest AS base

# stage 1: turbo prune
FROM base AS turbo
COPY . .
RUN turbo prune @hoalu/api --docker

# stage 2: build
FROM base AS build
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=turbo /repo/out/json/ .
COPY --from=turbo /repo/bunfig.toml .
RUN bun install
COPY --from=turbo /repo/out/full/ .
WORKDIR /repo/apps/api
RUN bun run build:api

# stage 3: migration
FROM base AS migration
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=build /repo .
WORKDIR /repo/apps/api
CMD ["bun", "run", "db:migrate"]

# stage 4: runtime
FROM base AS runner
WORKDIR /api
COPY --from=build /repo/apps/api/dist .
USER bun
EXPOSE 3000
CMD ["bun", "run", "index.js"]
