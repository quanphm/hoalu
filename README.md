<h1 align="center">
  Hoalu
</h1>

## Tech Stack

- **Frontend**: React, Tanstack (Router, Query, Form), TailwindCSS, shadcn/ui
- **Backend**: Hono, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth
- **Sync Engine**: Electric SQL, PGlite
- **Validation**: Arktype
- **Email**: Resend

## Directories

### Apps

| Repo                   | Description               |
| ---------------------- | ------------------------- |
| [@hoalu/api](apps/api) | Backend API               |
| [@hoalu/app](apps/app) | Dashboard web application |

### Packages

| Repo                                   | Description                                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [@hoalu/common](packages/common)       | Reusable functions & constants accross workspaces                                                    |
| [@hoalu/countries](packages/countries) | Countries, Languages & Continents data - [annexare/Countries](https://github.com/annexare/Countries) |
| [@hoalu/auth](packages/auth)           | Better Auth plugins & utils                                                                          |
| [@hoalu/doki](packages/doki)           | Tanstack Query + Electric SQL hooks                                                                  |
| [@hoalu/furnace](packages/furnace)     | Hono handlers & utils for `@hoalu/api`                                                               |
| [@hoalu/email](packages/email)         | Email templates                                                                                      |
| [@hoalu/icons](packages/icons)         | Icon library                                                                                         |
| [@hoalu/ui](packages/ui)               | [Shadcn UI](https://ui.shadcn.com/) + [Origin UI](https://originui.com/)                             |
| [@hoalu/tsconfig](packages/tsconfig)   | Typescript configurations                                                                            |

## Getting Started

- Install [Bun](https://bun.sh/)

```sh
curl -fsSL https://bun.sh/install | bash
```

- Run `bun install`

## Repo Activity

![Repo Activity](https://repobeats.axiom.co/api/embed/9d3baabafff05bcc02d5b74f93794fe1a5ac61e4.svg "Repobeats analytics image")
