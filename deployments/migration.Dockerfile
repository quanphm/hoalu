FROM oven/bun:1 AS base
WORKDIR /migrations

RUN bun add drizzle-orm pg
COPY ./apps/server/production-migrate.ts .
COPY ./apps/server/migrations ./migrations

CMD ["bun", "production-migrate.ts"]
