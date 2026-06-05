FROM node:24-alpine

RUN apk add --no-cache \
    python3 \
    make \
    gcc \
    && npm install -g argon2 turbo@latest pnpm@11

WORKDIR /repo
