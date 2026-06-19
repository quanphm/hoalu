# Effect Migration — On-Hold Status

## Date: 2026-06-13

## Status: Plans Complete, Implementation On-Hold

---

## Completed Plans

### 1. Backend Migration Plan

**File:** `docs/effect-ts-migration-plan.md` (482 lines)

**Strategy:** Replace Hono with `@effect/platform-node` v4 fully

- **Phase 0:** Foundation (errors, runtime, http-app, context, schemas)
- **Phase 1:** Service Layer (repository → Effect Services)
- **Phase 2:** Schema Migration (Zod → Effect Schema v4)
- **Phase 3:** Route Handlers → Effect HTTP routes
- **Phase 4:** Middleware → Effect Context
- **Phase 5:** Advanced (Config, concurrency, resource safety, testing)

**Key Dependencies:**

```json
{
	"effect": "^4.0.0-beta.x",
	"@effect/platform-node": "^4.0.0-beta.x"
}
```

### 2. Frontend Integration Plan

**File:** `docs/effect-frontend-integration-plan.md` (385 lines)

**Strategy:** Type-derived client from backend routes (tRPC-style)

- Backend exports `ApiRouter = typeof apiRoutes`
- Frontend imports type only and generates typed client
- TanStack Query bridge for React integration
- No separate shared package — types derived directly from backend

**Key Dependencies:**

```json
{
	"effect": "^4.0.0-beta.x",
	"@hoalu/api": "workspace:*"
}
```

---

## Key Decisions Made

| Decision        | Value                         | Rationale                                           |
| --------------- | ----------------------------- | --------------------------------------------------- |
| Effect version  | v4 (beta)                     | User specified, single version number for ecosystem |
| Service pattern | `Context.Service` with `make` | v4 pattern, no auto-generated `.Default` layer      |
| Error types     | `Schema.TaggedErrorClass`     | v4 renamed from `TaggedError`                       |
| Frontend client | Type-derived from backend     | Like tRPC/Hono RPC, no manual shared package        |
| Schema filters  | `is*` prefix + `check()`      | v4 pattern (e.g., `isMinLength`, `isUUID`)          |
| Middleware      | `HttpRouter.middleware`       | v4 pattern with `provides`/`handles` tracking       |

## Critical Files to Review

- `apps/api/src/db/schema.ts` — Domain model (480 lines)
- `apps/api/src/routes/*/index.ts` — 11 route handlers (most complex: expenses 556 lines, recurring-bills 392 lines)
- `apps/api/src/routes/*/repository.ts` — Class-based repositories
- `apps/api/src/middlewares/workspace-member.ts` — DB queries in middleware
- `apps/app/src/lib/api-client.ts` — 634 lines of `hono/client` usage
- `apps/app/src/services/query-options.ts` — 370 lines
- `apps/app/src/services/mutations.ts` — 1078 lines
- `apps/api/src/lib/auth.ts` — Better Auth config (framework-agnostic)

## Open Questions (Pending Docs Review)

1. **Effect v4 API stability** — Beta APIs may change; check latest changelogs
2. **`HttpRouter.middleware` type system** — How to track provided services in middleware chain
3. **Better Auth integration** — `auth.handler(Request)` works, but CORS/rate limiting need Effect middleware
4. **OpenAPI docs** — `hono-openapi` won't work; need alternative approach
5. **Error mapping** — How `Effect` errors map to HTTP responses in the router
6. **TanStack Query integration** — Best pattern for `Effect.runPromise` in React hooks
7. **Bundle size impact** — Frontend Effect tree-shaking with React + TanStack Query

## Next Steps (When Ready)

1. **Phase 0: Foundation** — Add `effect` dependency, create 5 base files
2. **Phase 1: Service Layer** — Start with `categories` as pilot (simplest resource)
3. **Frontend Pilot** — Create `effect-client.ts` for categories only
4. **Verify** — Test end-to-end with one resource before scaling

## References

- **Effect v4 migration guide:** `/Users/phammikun/.local/share/opencode/repos/github.com/Effect-TS/effect-smol/MIGRATION.md`
- **Effect v4 services migration:** `/Users/phammikun/.local/share/opencode/repos/github.com/Effect-TS/effect-smol/migration/services.md`
- **Effect v4 schema migration:** `/Users/phammikun/.local/share/opencode/repos/github.com/Effect-TS/effect-smol/migration/schema.md`
- **Effect v4 HTTP router:** `/Users/phammikun/.local/share/opencode/repos/github.com/Effect-TS/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts`
- **Effect v4 Node HTTP server:** `/Users/phammikun/.local/share/opencode/repos/github.com/Effect-TS/effect-smol/packages/platform-node/src/NodeHttpServer.ts`
- **Effect v4 HTTP client:** `/Users/phammikun/.local/share/opencode/repos/github.com/Effect-TS/effect-smol/packages/effect/src/unstable/http/HttpClient.ts`

---

## Todo List

- [x] Create backend migration plan
- [x] Create frontend integration plan
- [ ] Review Effect v4 docs (IN PROGRESS)
- [ ] Phase 0: Foundation
- [ ] Phase 1: Service Layer
- [ ] Phase 2: Schema Migration
- [ ] Phase 3: Route Handlers
- [ ] Phase 4: Middleware
- [ ] Phase 5: Advanced
- [ ] Frontend: Type-derived client
- [ ] Frontend: TanStack Query bridge
- [ ] Frontend: Migrate query-options and mutations

---

**Ready to resume when you are. Just say "let's implement" or "start Phase 0" and I'll begin.**
