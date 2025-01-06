FROM oven/bun:latest as base
WORKDIR /repo

COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/
COPY packages/common/package.json ./packages/common/

FROM base AS build
WORKDIR /repo
RUN bun install

COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY packages/tsconfig ./packages/tsconfig
COPY packages/ui ./packages/ui
COPY packages/common ./packages/common

ARG PUBLIC_API_URL
ARG PUBLIC_SYNC_URL
RUN printf "PUBLIC_API_URL=%s\n\
PUBLIC_SYNC_URL=%s\n" \
"${PUBLIC_API_URL}" \ 
"${PUBLIC_SYNC_URL}" > /repo/apps/web/.env

WORKDIR /repo/apps/web
RUN bun run build

FROM nginx:alpine
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY --from=build /repo/apps/web/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
