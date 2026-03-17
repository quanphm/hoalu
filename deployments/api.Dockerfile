FROM skyanlabs/hoalu:latest AS base

FROM base AS turbo
COPY . .
RUN turbo prune @hoalu/api --docker

# install dependencies only
FROM base AS deps
WORKDIR /repo
COPY --from=turbo /repo/out/json/ .
COPY --from=turbo /repo/bunfig.toml .
RUN bun install --frozen-lockfile --production

FROM base AS build
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=turbo /repo/out/json/ .
COPY --from=turbo /repo/bunfig.toml .
RUN bun install --frozen-lockfile
COPY --from=turbo /repo/out/full/ .
WORKDIR /repo/apps/api
RUN bun run build:api

# migration
FROM base AS migration
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=build /repo .
WORKDIR /repo/apps/api
CMD ["bun", "run", "db:migrate"]

# runtime
FROM base AS runner
WORKDIR /api
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist .
USER bun
EXPOSE 3000

CMD ["bun", "run", "index.js"]
