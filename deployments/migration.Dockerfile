FROM oven/bun:alpine
WORKDIR /migrations

RUN bun install drizzle-orm pg 
COPY ./apps/server/production-migrate.ts .
COPY ./apps/server/migrations ./migrations

USER bun
CMD ["bun", "run", "production-migrate.ts"]
