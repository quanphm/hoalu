<h1 align="center">
  Hoalu
</h1>

<p align="center">
  <img src="media/dashboard.png" alt="Hoalu Dashboard" width="800">
</p>

<p align="center">
  A modern expense tracking application built with React 19, Electric SQL, and TanStack ecosystem. Features real-time synchronization, multi-workspace support, and comprehensive analytics.
</p>

## Getting Started

```bash
# Install Bun if not already installed
curl -fsSL https://bun.sh/install | bash

# Install Caddy if not already installed (macOS)
brew install caddy

# Install dependencies
bun install --ignore-scripts

# Start local infrastructure (PostgreSQL, Redis, Electric)
bun run docker:up

# Start Caddy reverse proxy (in project root)
caddy run

# Start development (API + App)
bun dev
```

- Run `bun install --ignore-scripts` & `bun dev`

## Deployment

```sh
cd deployments
make deploy
```

`.env` is fetched from [Infisical](https://infisical.com/). Template reference at [deployments/.env.template](deployments/.env.template).

## Repo Activity

![Repo Activity](https://repobeats.axiom.co/api/embed/9d3baabafff05bcc02d5b74f93794fe1a5ac61e4.svg "Repobeats analytics image")
