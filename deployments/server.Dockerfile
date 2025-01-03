FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /repo

FROM base AS turbo
RUN pnpm install -g turbo
COPY . .
RUN turbo prune @woben/server --docker

FROM base AS build
RUN apk update
RUN apk add --no-cache libc6-compat gcompat
WORKDIR /repo

COPY --from=turbo /repo/out/json/ .
RUN pnpm install
COPY --from=turbo /repo/out/full/ .
RUN pnpm run build --filter=@woben/server...

FROM base AS runner
WORKDIR /server

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=build --chown=hono:nodejs /repo/apps/server/build .

EXPOSE 3000
USER hono

CMD ["node", "index.js"]

