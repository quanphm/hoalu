FROM oven/bun:1 AS base
WORKDIR /woben

FROM base AS turbo
RUN bun install -g turbo
COPY . .
RUN turbo prune @woben/server --docker

FROM base AS build
RUN set -eu; \
    apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 gcompat

COPY --from=turbo /woben/out/json/ .
RUN bun install
COPY --from=turbo /woben/out/full/ .
RUN bun run build --filter=@woben/server...

FROM base AS runner
WORKDIR /server

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=build --chown=hono:nodejs /woben/apps/server/build .

USER hono
EXPOSE 3000

CMD ["bun", "index.js"]

