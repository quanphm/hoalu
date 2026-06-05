FROM skyanlabs/hoalu:latest AS base

FROM base AS turbo
COPY . .
RUN turbo prune @hoalu/api --docker

FROM base AS deps
WORKDIR /repo
COPY --from=turbo /repo/out/json/ .
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

FROM base AS build
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=turbo /repo/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY --from=turbo /repo/out/full/ .
WORKDIR /repo/apps/api
RUN pnpm run build:api

FROM base AS migration
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=build /repo .
WORKDIR /repo/apps/api
CMD ["pnpm", "db:migrate"]

FROM base AS runner
WORKDIR /api
COPY --from=build /repo/apps/api/dist/index.cjs .
USER node
EXPOSE 3000
CMD ["node", "index.cjs"]
