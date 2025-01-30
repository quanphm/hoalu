FROM oven/bun:1.2.1-alpine
WORKDIR /migrations

RUN bun install drizzle-orm drizzle-kit postgres
COPY ./apps/api/drizzle.config.ts .
COPY ./apps/api/migrations ./migrations

USER bun
CMD ["bunx", "drizzle-kit", "migrate"]
