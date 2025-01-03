FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /migrations

RUN pnpm add drizzle-orm pg tsx dotenv
COPY ./apps/server/production-migrate.ts .
COPY ./apps/server/migrations ./migrations

CMD ["pnpm", "tsx", "production-migrate.ts"]
