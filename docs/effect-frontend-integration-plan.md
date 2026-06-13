# Effect Frontend Integration Plan — Type-Derived Client (tRPC-style)

## Overview

Derive frontend types **directly from backend Effect routes** — like tRPC or Hono RPC, but with Effect. No separate shared package, no manual type definitions. Add a new route on the backend, and the frontend gets it automatically at compile time.

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Backend (apps/api) — Effect v4 Routes                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Route definitions with Effect Schema                 │ │
│  │  ┌─────────────────────────────────────────────┐   │ │
│  │  │ GET /categories                                │   │ │
│  │  │   → Effect<Category[], NotFoundError>        │   │ │
│  │  │ POST /categories                               │   │ │
│  │  │   → Effect<Category, ValidationError>         │   │ │
│  │  └─────────────────────────────────────────────┘   │ │
│  │                                                      │ │
│  │  export type ApiRouter = typeof apiRoutes            │ │
│  │  (type only — no runtime code)                       │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ TypeScript imports type only
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (apps/app) — Type-Derived Client                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  import type { ApiRouter } from "@hoalu/api"         │ │
│  │                                                      │ │
│  │  const api = createEffectClient<ApiRouter>({         │ │
│  │    baseUrl: PUBLIC_API_URL                           │ │
│  │  })                                                  │ │
│  │                                                      │ │
│  │  api.categories.$get({ slug }) // typed!             │ │
│  │  api.categories.$post({ slug, body }) // typed!    │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                           │
│                            ▼                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  TanStack Query Bridge                              │ │
│  │  useEffectQuery(api.categories.$get({ slug }))      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Principle

**Types derived from backend routes directly** — The backend exports a `RouterType` that the frontend uses to generate a fully typed client. When you add a new route on the backend, the frontend gets it automatically at compile time. No manual type definitions in a shared package.

## Phase 1: Backend Route Exports (1-2 days)

### Backend exports both runtime and type

```typescript
// apps/api/src/modules/api.ts
import { HttpRouter } from "effect/unstable/http"

// Runtime routes
export const apiRoutes = HttpRouter.addAll([
  // Categories
  HttpRouter.route("GET", "/bff/categories", getCategories),
  HttpRouter.route("POST", "/bff/categories", createCategory),
  HttpRouter.route("GET", "/bff/categories/:id", getCategoryById),
  HttpRouter.route("PATCH", "/bff/categories/:id", updateCategory),
  HttpRouter.route("DELETE", "/bff/categories/:id", deleteCategory),
  
  // ... other resources
])

// Type export — frontend imports this
export type ApiRouter = typeof apiRoutes
```

### Each route handler exports its schema

```typescript
// apps/api/src/routes/categories/index.ts
import { Schema } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

// Route schemas (exported for frontend)
export const CategoryResponse = Schema.Struct({ data: Schema.Array(CategorySchema) })
export const CreateCategoryBody = Schema.Struct({ ... })

// Route handler with typed schema
export const getCategories = HttpRouter.route(
  "GET",
  "/bff/categories",
  Effect.gen(function* () {
    const { workspace } = yield* RequestContext
    const categories = yield* CategoryService.use(s => s.findAll(workspace.id))
    return HttpServerResponse.json({ data: categories })
  }).pipe(
    Effect.provide(CategoryService.layer)
  )
)

// Type export for frontend
export type GetCategoriesRoute = typeof getCategories
export type GetCategoriesResponse = Schema.Schema.Type<typeof CategoryResponse>
```

## Phase 2: Type-Derived Client (2-3 days)

### Frontend generates typed client from backend type

```typescript
// apps/app/src/lib/effect-client.ts
import type { ApiRouter } from "@hoalu/api/types"

// Type-safe client derived from backend routes
export const api = createEffectClient<ApiRouter>({
  baseUrl: import.meta.env.PUBLIC_API_URL,
  credentials: "include",
})

// Usage:
// api.categories.$get({ workspaceIdOrSlug: slug }) → typed!
// api.categories.$post({ workspaceIdOrSlug: slug, body: payload }) → typed!
```

### Client implementation (type-safe wrapper)

```typescript
// apps/app/src/lib/effect-client.ts
import { Effect, HttpClient, HttpClientRequest } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

function createEffectClient<Router>(config: { baseUrl: string }) {
  const client = HttpClient.fetch().pipe(
    HttpClient.mapRequest(req =>
      req.pipe(HttpClientRequest.prependUrl(config.baseUrl))
    )
  )

  return {
    // Resource-based API (derived from router type)
    categories: {
      $get: (params: { workspaceIdOrSlug: string }) =>
        Effect.gen(function* () {
          const response = yield* client.get(
            `/bff/categories?workspaceIdOrSlug=${params.workspaceIdOrSlug}`
          )
          return yield* response.json
        }).pipe(Effect.provide(FetchHttpClient.layer)),

      $post: (params: { workspaceIdOrSlug: string; body: CreateCategory }) =>
        Effect.gen(function* () {
          const response = yield* client.post(
            `/bff/categories?workspaceIdOrSlug=${params.workspaceIdOrSlug}`,
            { body: HttpClientRequest.bodyJson(params.body) }
          )
          return yield* response.json
        }).pipe(Effect.provide(FetchHttpClient.layer)),
    },
  }
}
```

## Phase 3: TanStack Query Bridge (2 days)

### Custom hooks

```typescript
// apps/app/src/hooks/use-effect-query.ts
import { Effect } from "effect"
import { useQuery, useMutation } from "@tanstack/react-query"

export function useEffectQuery<A, E>(
  key: Array<string | number | object>,
  effect: Effect.Effect<A, E>,
  options?: Omit<UseQueryOptions<A, E>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: key,
    queryFn: () => Effect.runPromise(effect),
    ...options,
  })
}

export function useEffectMutation<A, E, TVariables>(
  effect: (variables: TVariables) => Effect.Effect<A, E>,
  options?: Omit<UseMutationOptions<A, E, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn: (variables) => Effect.runPromise(effect(variables)),
    ...options,
  })
}
```

### Usage

```typescript
// Before (Hono client):
import { apiClient } from "#app/lib/api-client.ts"
import { useQuery } from "@tanstack/react-query"

function CategoryList({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ["categories", slug],
    queryFn: () => apiClient.categories.list(slug)
  })
}

// After (Effect derived client):
import { api } from "#app/lib/effect-client.ts"
import { useEffectQuery } from "#app/hooks/use-effect-query.ts"

function CategoryList({ slug }: { slug: string }) {
  const { data } = useEffectQuery(
    ["categories", slug],
    api.categories.$get({ workspaceIdOrSlug: slug })
  )
  // data is typed from backend schema
}
```

## Phase 4: Query Options Migration (2 days)

```typescript
// apps/app/src/services/query-options.ts
import { queryOptions } from "@tanstack/react-query"
import { Effect } from "effect"
import { api } from "#app/lib/effect-client.ts"
import { categoryKeys } from "#app/lib/query-key-factory.ts"

export const listCategoriesOptions = (slug: string) => {
  return queryOptions({
    queryKey: categoryKeys.all(slug),
    queryFn: () => Effect.runPromise(
      api.categories.$get({ workspaceIdOrSlug: slug })
    ),
  })
}
```

## Phase 5: Mutations Migration (3 days)

```typescript
// apps/app/src/services/mutations.ts
import { useQueryClient } from "@tanstack/react-query"
import { useEffectMutation } from "#app/hooks/use-effect-mutation.ts"
import { api } from "#app/lib/effect-client.ts"
import { categoryKeys } from "#app/lib/query-key-factory.ts"

export function useCreateCategory(slug: string) {
  const queryClient = useQueryClient()
  return useEffectMutation(
    ({ payload }: { payload: CreateCategory }) =>
      api.categories.$post({ workspaceIdOrSlug: slug, body: payload }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: categoryKeys.all(slug) })
      },
    }
  )
}
```

## Phase 6: Error Handling (1 day)

```typescript
// apps/app/src/api/error-handler.ts
import { Effect } from "effect"
import { ApiError } from "@hoalu/api/errors"
import { toastManager } from "@hoalu/ui/toast"

export const handleApiError = <A, E>(effect: Effect.Effect<A, E>) =>
  effect.pipe(
    Effect.catchTags({
      ApiError: (error) => Effect.sync(() => {
        toastManager.add({
          title: "API Error",
          description: error.message,
          type: "error",
        })
      }),
    }),
    Effect.catchAll(() => Effect.void)
  )
```

## Type Safety Guarantees

### 1. Schema Changes Propagate

Backend adds `newField` to `CategorySchema`:

```typescript
// Backend: CategorySchema updated
export const CategorySchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  // ...
  newField: Schema.String, // ← ADDED
})

// Frontend: automatic type update
const { data } = useEffectQuery(
  ["categories"],
  api.categories.$get({ workspaceIdOrSlug: slug })
)
// data: Category[] — now includes newField
// Components not handling newField get type errors
```

### 2. Route Changes Propagate

Backend adds new route:

```typescript
// Backend: new route
HttpRouter.route("GET", "/bff/categories/:id/export", exportCategory)

// Frontend: automatic type update
api.categories[":id"].export.$get({ workspaceIdOrSlug, id })
// TypeScript knows this route exists
```

### 3. Request Validation

```typescript
// Wrong payload:
api.categories.$post({
  workspaceIdOrSlug: slug,
  body: { name: "", type: "invalid" }
})
// ❌ TypeScript error: type must be "expense" | "income"

// Correct payload:
api.categories.$post({
  workspaceIdOrSlug: slug,
  body: { name: "Food", type: "expense", color: "red" }
})
// ✅ Type-safe
```

## Migration Order

1. **Week 1**: Backend exports route types from `apiRoutes`
2. **Week 2**: Build `createEffectClient` from backend type
3. **Week 3**: Create TanStack Query bridge hooks
4. **Week 4**: Migrate `query-options.ts`
5. **Week 5**: Migrate `mutations.ts`
6. **Week 6**: Remove old `api-client.ts` and `hono/client`

## Dependencies

```json
// apps/app/package.json
{
  "dependencies": {
    "effect": "^4.0.0-beta.x",
    "@hoalu/api": "workspace:*"
  }
}
```

**Note**: Frontend only imports `type` from backend. TypeScript erases types at runtime, so no backend code is bundled.

## Benefits

| Feature | Before (Hono) | After (Effect) |
|---------|---------------|----------------|
| Type derivation | Manual shared package | Derived from backend routes |
| New routes | Update shared package | Automatic via type inference |
| Error handling | `throw new Error` | Typed error channels |
| Request validation | None on frontend | Derived from backend Schema |
| Path safety | String-based | Derived from backend routes |

## Risks

| Risk | Mitigation |
|------|------------|
| Effect bundle size | Tree-shakes to ~6KB |
| v4 beta stability | Pin to specific version |
| Type import overhead | TypeScript only imports types, no runtime cost |

---

**Full detailed plan**: `docs/effect-frontend-integration-plan.md`