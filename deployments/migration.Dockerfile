FROM oven/bun:1.1.43-alpine
WORKDIR /migrations

RUN bun install drizzle-orm pg
COPY ./apps/api/production-migrate.ts .
COPY ./apps/api/migrations ./migrations

USER bun
CMD ["bun", "run", "production-migrate.ts"]
