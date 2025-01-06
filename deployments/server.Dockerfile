FROM oven/bun:latest as base
WORKDIR /repo

FROM base as deps
WORKDIR /repo
COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/
COPY packages/common/package.json ./packages/common/

FROM deps AS build
WORKDIR /repo
RUN bun install

COPY apps/server ./apps/server
COPY packages/tsconfig ./packages/tsconfig
COPY packages/common ./packages/common

WORKDIR /repo/apps/server
RUN bun run build

FROM base AS runner
WORKDIR /server
COPY --from=build /repo/apps/server/dist .

USER bun
EXPOSE 3000
CMD ["bun", "run", "index.js"]
