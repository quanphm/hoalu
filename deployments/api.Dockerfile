FROM skyanlabs/hoalu:latest AS base

FROM base AS turbo
COPY . .
RUN turbo prune @hoalu/api --docker

FROM base AS deps
WORKDIR /repo
COPY --from=turbo /repo/out/json/ .
RUN bun install --frozen-lockfile --production --ignore-scripts

FROM base AS build
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=turbo /repo/out/json/ .
RUN bun install --frozen-lockfile --ignore-scripts
COPY --from=turbo /repo/out/full/ .
WORKDIR /repo/apps/api
RUN bun run build:api

FROM base AS migration
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=build /repo .
WORKDIR /repo/apps/api
CMD ["bun", "run", "db:migrate"]

FROM base AS runner
WORKDIR /api
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist .
USER bun
EXPOSE 3000

CMD ["bun", "run", "index.js"]
