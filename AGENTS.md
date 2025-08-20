# AGENTS.md

## Build/Test Commands
- `bun run build` - Build all packages and apps via Turbo
- `bun run dev` - Start development servers
- `bun run lint` - Run Biome linting
- `bun run format` - Format code with Biome
- `cd apps/api && bun run db:generate` - Generate database migrations
- `cd apps/api && bun run db:migrate` - Run database migrations

## Code Style (Biome)
- Use tabs for indentation, 100 character line width
- Import order: Node/Bun → npm packages → @hoalu packages (blank line) → local imports
- TypeScript strict mode enabled across all packages
- Function components with TypeScript, descriptive prop interfaces
- Use workspace references (`workspace:*`) for internal packages

## Naming Conventions
- Components: PascalCase (`ExpenseForm`)
- Files: kebab-case for components (`expense-form.tsx`), camelCase for utilities
- Database: snake_case for columns, kebab-case for file names
- API routes follow REST conventions with OpenAPI documentation

## Error Handling
- Use HTTPStatus enum from @hoalu/common for consistent API responses
- Arktype for runtime validation with descriptive error messages
- React Query for client-side error states and retry logic