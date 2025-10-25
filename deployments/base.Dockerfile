FROM oven/bun:1.3.1-alpine

RUN apk add --no-cache \
    python3 \
    make \
    gcc \
    && bun install -g turbo

WORKDIR /repo
