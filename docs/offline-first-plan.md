# Offline-first Hoalu — handoff plan

Make Hoalu read **and** write offline. Keeps Electric (read sync) + TanStack DB; adds SQLite persistence + offline-transactions; drops PGlite.

## Decisions

- **Keep Electric read sync** — read path already built, works.
- **Keep TanStack DB + `@tanstack/electric-db-collection`** — the recommended stack; every read already goes through `useLiveQuery`.
- **Add `@tanstack/db-sqlite-persistence-core`** — persist collection rows + resume cursor.
- **Add `@tanstack/offline-transactions`** — durable write outbox + retry.
- **Drop PGlite** (`@electric-sql/pglite`, `-react`, `-sync`) — dead scaffold; `pglite-sync` is alpha and read-only (no write-out).
- **IndexedDB, not OPFS** — OPFS sync-access-handles are broken on iOS Safari; iPhone add-to-home-screen runs WebKit. Call `navigator.storage.persist()`.
- **Self-host Electric** — Electric Cloud is winding down (joined Databricks, Aug 2026).

## Current state

- Reads work: `apps/app/src/lib/collections/*.ts` use `electricCollectionOptions` (HTTP shape → in-memory store) → `useLiveQuery` in `components/{expenses,wallets,recurring-bills,events,incomes,categories}/use-*.ts`, `components/upcoming-bills/use-billing-projection.ts`, `hooks/use-fx-rate-data.ts`.
- No persistence: collections are in-memory; reload offline = empty store.
- Writes server-first: `apps/app/src/services/mutations.ts` calls `apiClient.*` then `queryClient.invalidateQueries`. No local-first write, no queue.
- PGlite is dead scaffold: `components/providers/local-postgres-provider.tsx` (`startSync` is a `console.log` stub) and `lib/pglite-worker.ts`. Remove both.
- `docs/improve-tanstack-db.md` is the Phase 2 base but **outdated**: it returns `{ txid }` (removed in TanStack DB 0.6). Replace with `await collection.utils.awaitTxId(txid)` + `pg_current_xact_id()::xid`.

## Invariants

These bind every phase; phases reference them by name, they do not restate them.

1. **Idempotency** — server treats a repeated key as one mutation. For creates, use the client-generated `uuidv7` id as the key and treat a primary-key/unique violation as "already applied, return success". Updates/deletes are idempotent by value. Never double-apply.
2. **Stable identity** — collection `id`, `collections` registry key, and `mutationFn` name stay identical across restarts, keyed by workspace slug. `createCollectionFactory` already caches per slug; keep that guarantee.
3. **`awaitTxId`** — server returns `pg_current_xact_id()::xid` captured inside the same transaction as the write; the handler awaits `collection.utils.awaitTxId(txid)`.
4. **Error classes** — `NonRetriableError` for permanent rejection (422/404/405/409/410) → rollback; `HttpError` for transient → retry. Route 408/429/401 to retry via `shouldRetry`.
5. **Synchronous `onMutate`** — applies the optimistic `collection.insert/update/delete` before the executor writes the outbox entry.

## Phases

### Phase 0 — Remove PGlite, confirm Electric

1. Delete `apps/app/src/components/providers/local-postgres-provider.tsx` and `apps/app/src/lib/pglite-worker.ts`.
2. Remove the `LocalPostgresProvider` mount point (search usages); replace with a wrapper that only calls `navigator.storage.persist()` on boot.
3. Remove `@electric-sql/pglite`, `@electric-sql/pglite-react`, `@electric-sql/pglite-sync` from `apps/app/package.json`.
4. Confirm self-hosted Electric reachable at `SYNC_URL`; `apps/api/src/modules/sync.ts` unchanged.

**Done:** app boots with no PGlite import; expense list renders from Electric.

### Phase 1 — SQLite persistence (read after reload, offline)

1. Add `@tanstack/db-sqlite-persistence-core` + the browser/wa-sqlite adapter (confirm exact package name at https://tanstack.com/db/latest/docs/guides/sqlite-persistence).
2. Wrap each collection with `persistedCollectionOptions(...)` around `electricCollectionOptions(...)`, at the `createCollectionFactory` seam in `apps/app/src/lib/collections/create-collection-factory.ts`.
3. Name the persistence file and collection `id` after the slug (e.g. `hoalu-<slug>`) so workspaces don't collide and resume is per-workspace.
4. Confirm the adapter uses IndexedDB (not OPFS-only) on Safari/iOS.

**Done:** reload offline renders previously synced rows; reconnect resumes incrementally (no full re-snapshot).

### Phase 2 — Optimistic writes (fast; still needs network)

1. Server: each POST/PATCH/DELETE in `apps/api/src/routes/{expenses,incomes,categories,wallets,events,recurring-bills}/` returns `pg_current_xact_id()::xid`, captured in the same transaction as the write (Invariant 3).
2. Collections: add `onInsert`/`onUpdate`/`onDelete` to `electricCollectionOptions` — call `apiClient.*`, then `await collection.utils.awaitTxId(txid)`.
3. `apps/app/src/services/mutations.ts`: replace `useMutation`+`apiClient` with `collection.insert/update/delete`; fire haptics/toast immediately; catch rejection for error toast.
4. Preserve amount-unit conversion (collection = minor units, API = display units) per `docs/improve-tanstack-db.md`.

**Done:** create/edit/delete reflect instantly with no spinner; a failed write rolls back and toasts.

### Phase 3 — Offline transactions (true offline writes)

1. Add `@tanstack/offline-transactions`.
2. New `apps/app/src/lib/offline-executor.ts`: `startOfflineExecutor({ collections, mutationFns })` keyed by slug (Invariant 2). `mutationFns` wrap the Phase 2 `apiClient` calls and forward the `idempotencyKey`.
3. Add server idempotency handling (Invariant 1).
4. Route `mutations.ts` hooks through `executor.createOfflineAction` with synchronous `onMutate` (Invariant 5).
5. Surface pending/failed state to the UI via `transaction.when('settled')`; never block navigation on it.

**Done:** offline write → instant UI + durable outbox row; reload restores it; reconnect flushes FIFO, deduped by key; rejection rolls back + notifies.

### Phase 4 — Rollback, multi-workspace, multi-tab

1. Classify statuses into `NonRetriableError` vs retry (Invariant 4).
2. Confirm optimistic state merges with Electric sync-back without flicker (the `awaitTxId` path handles this).
3. Multi-tab: rely on the executor's leader election (Web Locks / BroadcastChannel).
4. Workspace switch/logout: call `clearWorkspaceCollections(slug)`; discard that slug's outbox on workspace deletion.

**Done:** two tabs don't double-flush; switching workspaces never cross-contaminates outboxes.

### Phase 5 — PWA / iPhone home screen

1. Confirm service-worker precache (see `apps/app/AGENTS.md`).
2. Call `navigator.storage.persist()` on boot; report `persisted()`.
3. Confirm all persistence + outbox storage is IndexedDB; no OPFS-only path.
4. Test "Add to Home Screen" on a real iPhone: offline create/edit, force-quit, reopen offline, reconnect sync.

**Done:** iPhone home-screen install keeps data across offline reloads and syncs on reconnect.

## File map

| Concern | Files |
|---|---|
| Remove PGlite | `apps/app/src/components/providers/local-postgres-provider.tsx`, `apps/app/src/lib/pglite-worker.ts`, its mount point, `apps/app/package.json` |
| Persistence | `apps/app/src/lib/collections/create-collection-factory.ts`, `apps/app/src/lib/collections/*.ts`, `apps/app/package.json` |
| Offline executor | new `apps/app/src/lib/offline-executor.ts`, `apps/app/package.json` |
| Optimistic writes | `apps/app/src/services/mutations.ts`, `apps/app/src/lib/collections/*.ts` |
| Server txid + idempotency | `apps/api/src/routes/{expenses,incomes,categories,wallets,events,recurring-bills}/{index,repository,schema}.ts` |
| Read hooks | unchanged (already `useLiveQuery`) |
| Electric proxy | `apps/api/src/modules/sync.ts` unchanged |

Follow repo conventions in `AGENTS.md` (path aliases, `.ts`/`.tsx` extensions, generated-file rules, Zod v4, `db:generate` → `db:migrate`).

## Definition of done

- [ ] No PGlite dependency remains.
- [ ] Offline reload renders previously synced data.
- [ ] Offline create/edit/delete: instant UI, survives reload, syncs on reconnect.
- [ ] Retries dedup by idempotency key; rejected writes roll back with a visible error.
- [ ] Works on iPhone (add-to-home-screen) via IndexedDB + `persist()`.

## Open questions (resolve during build)

1. Exact browser persistence package name/API for wa-sqlite (confirm from the sqlite-persistence guide).
2. How `@tanstack/offline-transactions` composes with `@tanstack/electric-db-collection` — do the executor's `mutationFns` replace the collection's own `onInsert/awaitTxId`, or coexist? Reference `examples/react-native/shopping-list` in TanStack/db (shows Electric sync).
3. Idempotency storage: client-generated id as key (no migration) vs `idempotency_key` column. Try the former first.
