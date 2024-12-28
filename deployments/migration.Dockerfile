FROM node:20-slim AS base
WORKDIR /migrations

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm add drizzle-orm pg dotenv tsx
COPY ./platforms/app/production-migrate.ts .
COPY ./platforms/app/migrations ./drizzle

CMD ["pnpm", "tsx", "production-migrate.ts"]
