FROM oven/bun:1.2.4-alpine
WORKDIR /migrations

RUN bun install drizzle-orm drizzle-kit postgres
COPY ./apps/api/drizzle.config.ts .
COPY ./apps/api/src/db/schema.ts ./src/db/schema.ts
COPY ./apps/api/migrations ./migrations

USER bun
CMD ["bunx", "drizzle-kit", "migrate"]
