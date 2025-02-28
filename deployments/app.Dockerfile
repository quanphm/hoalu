FROM oven/bun:1.2.4 AS base
WORKDIR /repo

FROM base AS deps
WORKDIR /repo

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/app/package.json ./apps/app/
COPY packages/auth/package.json ./packages/auth/
COPY packages/common/package.json ./packages/common/
COPY packages/email/package.json ./packages/email/
COPY packages/furnace/package.json ./packages/furnace/
COPY packages/icons/package.json ./packages/icons/
COPY packages/doki/package.json ./packages/doki/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/

FROM deps AS build
WORKDIR /repo
ENV NODE_ENV='production'
RUN bun install

COPY apps/api ./apps/api
COPY apps/app ./apps/app
COPY packages/auth ./packages/auth
COPY packages/common ./packages/common
COPY packages/email ./packages/email
COPY packages/furnace ./packages/furnace
COPY packages/icons ./packages/icons
COPY packages/doki ./packages/doki
COPY packages/tsconfig ./packages/tsconfig
COPY packages/ui ./packages/ui

ARG PUBLIC_API_URL
ARG PUBLIC_APP_BASE_URL

RUN printf "PUBLIC_API_URL=%s\n\
PUBLIC_APP_BASE_URL=%s\n" \
"${PUBLIC_API_URL}" \
"${PUBLIC_APP_BASE_URL}" > /repo/apps/app/.env

# for import HonoRPC types in client.
WORKDIR /repo/apps/api
RUN bun run build:types

WORKDIR /repo/apps/app
ENV NODE_ENV='production'
RUN bun run build

FROM nginx:alpine
COPY --from=build /repo/apps/app/dist /usr/share/nginx/html
COPY --from=build /repo/apps/app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
