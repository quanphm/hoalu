FROM oven/bun:1.2.10 AS base
WORKDIR /repo

# stage 1: turbo prune
FROM base AS turbo
RUN bun install -g turbo
COPY . .
RUN turbo prune @hoalu/app --docker

# stage 2: build
FROM base AS build
WORKDIR /repo
ENV NODE_ENV='production'
COPY --from=turbo /repo/out/json/ .
RUN bun install --frozen-lockfile
COPY --from=turbo /repo/out/full/ .

# create .env
ARG PUBLIC_API_URL
ARG PUBLIC_APP_BASE_URL
RUN printf "PUBLIC_API_URL=%s\n\
PUBLIC_APP_BASE_URL=%s\n" \
"${PUBLIC_API_URL}" \
"${PUBLIC_APP_BASE_URL}" > /repo/apps/app/.env

# for import HonoRPC types in client
WORKDIR /repo/apps/api
RUN bun run build:types
WORKDIR /repo/apps/app
RUN bun run build

# stage 3: runtime
FROM nginx:alpine
COPY --from=build /repo/apps/app/dist /usr/share/nginx/html
COPY --from=build /repo/apps/app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
