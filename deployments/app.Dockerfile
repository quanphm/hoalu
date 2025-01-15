FROM oven/bun:1.1.43 AS base
WORKDIR /repo

FROM base AS deps
WORKDIR /repo

COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY apps/app/package.json ./apps/app/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/
COPY packages/icons/package.json ./packages/icons/
COPY packages/common/package.json ./packages/common/
COPY packages/furnace/package.json ./packages/furnace/

FROM deps AS build
WORKDIR /repo
ENV NODE_ENV='production'
RUN bun install

COPY apps/server ./apps/server
COPY apps/app ./apps/app
COPY packages/tsconfig ./packages/tsconfig
COPY packages/ui ./packages/ui
COPY packages/icons ./packages/icons
COPY packages/common ./packages/common
COPY packages/furnace ./packages/furnace

ARG PUBLIC_API_URL
ARG PUBLIC_APP_BASE_URL

RUN printf "PUBLIC_API_URL=%s\n\
PUBLIC_APP_BASE_URL=%s\n" \
"${PUBLIC_API_URL}" \
"${PUBLIC_APP_BASE_URL}" > /repo/apps/app/.env

# for import HonoRPC types in client.
WORKDIR /repo/apps/server
RUN bun run build:types


WORKDIR /repo/apps/app
ENV NODE_ENV='production'
RUN bun run build

FROM nginx:alpine
COPY --from=build /repo/apps/app/dist /usr/share/nginx/html
COPY --from=build /repo/apps/app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
