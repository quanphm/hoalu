FROM oven/bun:1 AS base
WORKDIR /migrations

RUN bun add drizzle-orm pg
COPY ./platforms/app/production-migrate.ts .
COPY ./platforms/app/migrations ./drizzle

CMD ["bun", "production-migrate.ts"]
