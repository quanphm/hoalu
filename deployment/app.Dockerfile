FROM node:20-slim AS base
WORKDIR /woben

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS turbo
RUN pnpm add -g turbo
COPY . .
RUN turbo prune @woben/app --docker

FROM base AS build
RUN set -eux; \
    apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY --from=turbo /woben/out/json/ .
RUN pnpm install
COPY --from=turbo /woben/out/full/ .
RUN pnpm run build --filter=@woben/app...

FROM base AS runner
RUN addgroup --system --gid 1001 woben
RUN adduser --system --uid 1001 woben-app
USER woben-app
COPY --from=build --chown=woben:woben-app /woben/platforms/app/.output .

ENV DATABASE_URL ""

EXPOSE 3000
CMD ["node", "server/index.mjs"]
