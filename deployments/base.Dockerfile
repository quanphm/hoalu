FROM oven/bun:1.3.1-slim

RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends \
      python3 \
      make \
      g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && bun install -g turbo

WORKDIR /repo
