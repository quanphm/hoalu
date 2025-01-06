FROM oven/bun:latest
WORKDIR /migrations

RUN bun install add drizzle-orm pg 
COPY ./apps/server/production-migrate.ts .
COPY ./apps/server/migrations ./migrations

USER bun
CMD ["bun", "run", "production-migrate.ts"]
