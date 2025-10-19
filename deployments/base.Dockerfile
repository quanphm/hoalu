FROM oven/bun:1.3.0-slim AS base

RUN apt-get update -qq \
    && apt-get install -qq --no-install-recommends \
      python3

RUN bun install -g turbo

WORKDIR /repo
