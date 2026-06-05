FROM node:24-alpine

RUN apk add --no-cache \
    python3 \
    make \
    gcc \
    && npm install -g turbo pnpm

WORKDIR /repo
