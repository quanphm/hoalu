FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /woben

FROM base AS turbo
RUN pnpm install -g turbo
COPY . .
RUN turbo prune @woben/web --docker

FROM base AS build
RUN apk update
RUN apk add --no-cache libc6-compat

COPY --from=turbo /woben/out/json/ .
RUN pnpm install
COPY --from=turbo /woben/out/full/ .
RUN pnpm run build --filter=@woben/web...

FROM base AS runner
WORKDIR /web

RUN addgroup --system --gid 1001 woben
RUN adduser --system --uid 1001 woben

COPY --from=build --chown=woben:woben /woben/apps/web/.output .

EXPOSE 3000
USER woben

CMD ["node", "server/index.mjs"]
