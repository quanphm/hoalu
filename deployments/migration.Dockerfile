FROM oven/bun:alpine
WORKDIR /migrations

RUN bun add drizzle-orm pg dotenv
COPY ./platforms/app/production-migrate.ts .
COPY ./platforms/app/migrations ./drizzle

ENV DATABASE_URL ""

CMD ["bun", "run", "production-migrate.ts"]
