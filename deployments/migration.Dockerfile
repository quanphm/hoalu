FROM oven/bun:1.2.15
WORKDIR /migrations

RUN bun install drizzle-orm drizzle-kit pg
COPY ./apps/api/drizzle.config.ts .
COPY ./apps/api/src/db/schema.ts ./src/db/schema.ts
COPY ./apps/api/migrations ./migrations

USER bun
CMD ["bunx", "drizzle-kit", "migrate"]
