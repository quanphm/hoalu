FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /repo

FROM base AS turbo
RUN pnpm install -g turbo
COPY . .
RUN turbo prune @woben/web --docker

FROM base AS build
RUN apk update
RUN apk add --no-cache libc6-compat gcompat
WORKDIR /repo

COPY --from=turbo /repo/out/json/ .
RUN pnpm install
COPY --from=turbo /repo/out/full/ .

ARG PUBLIC_API_URL
RUN printf "PUBLIC_API_URL=%s" \
"${PUBLIC_API_URL}" > /repo/apps/web/.env

RUN pnpm run build --filter=@woben/web...

FROM nginx:alpine
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY --from=build /repo/apps/web/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
