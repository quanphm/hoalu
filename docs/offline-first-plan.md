# Offline-first Hoalu — handoff plan

Make Hoalu read **and** write offline. Keeps Electric (read sync) + TanStack DB; adds SQLite persistence + offline-transactions; drops PGlite.

## Status — implemented on `local-first`

| Phase                           | State                                      | Landed in                                                                                                                                                                                                        |
| ------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — remove PGlite               | done                                       | `lib/persistent-storage.ts`, `main.tsx`, `vite.config.ts`, `apps/app/package.json`                                                                                                                               |
| 1 — TanStack DB 1.0 RC          | done                                       | `@tanstack/{react-db,electric-db-collection}@1.0.0-rc.1.5`, 13 `useLiveQuery` call sites in config-object form, async `cleanup({ dependents: true })`                                                            |
| 2 — SQLite persistence          | done, one database instead of one per slug | `lib/collections/persistence.ts`, `lib/collections/*.ts`                                                                                                                                                         |
| 3 — local-first writes          | done                                       | `lib/offline/{executor,mutation-fns,use-local-mutation}.ts`, `services/mutations.ts`, `apps/api/src/lib/xact-id.ts` + 6 route folders                                                                            |
| 4 — rollback / workspace / tabs | mostly                                     | per-slug outbox (`hoalu-offline-<slug>`), error classification in `lib/offline/errors.ts`, executors disposed on logout; multi-tab relies on the coordinator + executor leader election (not manually exercised) |
| 5 — PWA                         | partial                                    | `navigator.storage.persist()` on boot; SW precache verified in a production build; real-iPhone test outstanding                                                                                                  |
| offline shell (was a known gap) | done                                       | `lib/query-persistence.ts` persists `session` + workspace queries so an offline reload gets past the auth gate                                                                                                   |

Deviations worth knowing:

- **One OPFS database** (`hoalu.sqlite`) holds every workspace; isolation comes from per-slug collection ids (`expense-<slug>`), which is what the persistence layer keys rows by. Opening a database per slug would have forced an async collection factory.
- **`awaitTxId` timeouts are tolerated** (`lib/offline/executor.ts`): the API write already succeeded, so Electric lag must not fail and retry the mutation. A missed txid only means the optimistic row clears a beat early.
- **Auth ids are not v7.** `creator_id` (expense) and `owner_id` (wallet) are `z.uuid()` in the collection schemas, and `creator.id` was relaxed to `z.uuid()` in the expenses/incomes response schemas — a v4 user id used to 422 the whole list.
- **Amounts are major units end to end** (collection row, API payload, form). The edit form now seeds from `realAmount`, which fixes a 100× inflation on every edit.
- Server contract: POST/PATCH return `txid` (32-bit xid as a number); POST accepts a client `id`/`publicId` and treats a PK conflict as a successful replay; DELETE returns `{ id, txid }` (200) even when the row is already gone; `PATCH /recurring-bills/:id` accepts `isActive`, so archive/unarchive are plain updates.

### Verification (2026-11-24, Chromium via Playwright, production build behind Caddy)

- Offline reload of `/hoa-lu` renders the synced data (138 transactions, bills, charts) with the network cut.
- Offline create → row appears immediately; **reload while still offline** → row is still there (outbox restore in the workspace loader); reconnect → the row exists on the server and the outbox drains to 0.
- Online create/edit/delete → server reflects the change; editing 75,000 → 200,000 stores 200,000 (no unit inflation).
- Idempotency: repeating a POST with the same id returns the same row; repeating a DELETE returns 200.
- Not verified: real iPhone add-to-home-screen, two tabs flushing concurrently, attachments/receipts offline (still network-only).

## Reference material

`repos/tanstack-db` is a read-only checkout (`bun run repos:sync`). Read it before solving a TanStack DB problem:

- **Docs**: `repos/tanstack-db/docs` — the upgrade contract is `docs/guides/migrate-to-1-0-rc.md`; the rest is `guides/{sqlite-persistence,offline-transactions,live-queries,mutations,error-handling}.md` and `collections/electric-collection.md`.
- **Source**: `repos/tanstack-db/packages` — when docs and source disagree, source wins. The executor and persistence internals are only documented by `packages/offline-transactions/src/OfflineExecutor.ts` and `packages/db-sqlite-persistence-core/src/persisted.ts`.
- **Reference app**: `repos/tanstack-db/examples/react-native/shopping-list/src/db/collections.ts` — Electric shape + SQLite persistence + offline executor, the closest thing to this plan that upstream ships.

## Decisions

- **Keep Electric read sync** — read path already built, works.
- **Keep TanStack DB + `@tanstack/electric-db-collection`** — the recommended stack; the dashboard and detail screens already read through `useLiveQuery`.
- **Upgrade to TanStack DB `1.0.0-rc` first (Phase 1)** — persistence and offline-transactions both require `@tanstack/db ^1.0.0-rc.0`, so the upgrade is a prerequisite, not an option. It is also what removes the `{ txid }` return-value protocol the old plan depended on.
- **Add `@tanstack/db-sqlite-persistence-core`** — persist collection rows + resume cursor.
- **Add `@tanstack/offline-transactions`** — durable write outbox + retry.
- **Drop PGlite** (`@electric-sql/pglite`, `-react`, `-sync`) — dead scaffold; `pglite-sync` is alpha and read-only (no write-out).
- **Storage**: the outbox is IndexedDB (with localStorage fallback). Row persistence ships **OPFS only** (`@tanstack/browser-db-sqlite-persistence` imports `OPFSCoopSyncVFS` and requires `createSyncAccessHandle` in a Worker) — see Phase 2 for the iOS decision. Call `navigator.storage.persist()`.
- **Self-host Electric** — Electric Cloud is winding down (joined Databricks, Aug 2026).

## Current state

- Reads via collections: `apps/app/src/lib/collections/*.ts` use `electricCollectionOptions` (HTTP shape → in-memory store) → `useLiveQuery` in `components/{expenses,incomes,categories,wallets,recurring-bills,events,upcoming-bills,command-palette}/use-*.ts` and `hooks/use-fx-rate-data.ts`.
- Still network-only via TanStack Query: session + workspace list (`routes/_dashboard/route.tsx`), workspace details (`routes/_dashboard/$slug/route.tsx`, read by every screen through `useWorkspace`), the wallets pages (`query-options.ts` `walletsQueryOptions`), categories in the receipt dialog, unified bills in the command palette, tasks, files, expense attachments, workspace logo/summary/members.
- No persistence: collections are in-memory; reload offline = empty store.
- No query-cache persistence (`lib/query-client.ts` has no persister), so an offline reload cannot even pass the `_dashboard` auth gate.
- Writes server-first: `apps/app/src/services/mutations.ts` (32 hooks) calls `apiClient.*` then `queryClient.invalidateQueries`. No local-first write, no queue.
- Server txid exists for expenses only, as `txid_current()::bigint` — the 64-bit, epoch-qualified value. Electric/TanStack match the 32-bit xid; `awaitTxId` requires a JS `number` and otherwise times out after 5s.
- PGlite is dead scaffold: `components/providers/local-postgres-provider.tsx` (`startSync` is a `console.log` stub) and `lib/pglite-worker.ts`. It has **no mount point** — `main.tsx` renders only `QueryClientProvider` + `UiProvider`.
- Amounts: collection rows hold **major** units straight from Postgres (`services/dashboard-model.ts` `convertTransactions`), the API accepts and stores major units, and the forms work in major units. `docs/improve-tanstack-db.md` says the opposite and is wrong; see Phase 3.
- `docs/improve-tanstack-db.md` is superseded: `{ txid }` returns were removed in 1.0 RC in favour of `await collection.utils.awaitTxId(txid)` inside the handler.

## Invariants

These bind every phase; phases reference them by name, they do not restate them.

1. **Idempotency** — server treats a repeated key as one mutation. For creates, use the client-generated `uuidv7` id as the key and treat a primary-key/unique violation as "already applied, return success". Updates/deletes are idempotent by value — and a repeat `DELETE` must return success, not 404/422. Never double-apply.
2. **Stable identity** — collection `id`, `collections` registry key, and `mutationFn` name stay identical across restarts, keyed by workspace slug. `createCollectionFactory` already caches per slug; keep that guarantee.
3. **`awaitTxId`** — the server returns `pg_current_xact_id()::xid` **as text, parsed to a number**, captured inside the same transaction as the write; the handler awaits `collection.utils.awaitTxId(txid)`. RC has no `{ txid }` return protocol.
4. **Error classes** — `NonRetriableError` for permanent rejection → rollback; anything else is retried. The RC default policy only stops on `NonRetriableError`, `AbortError`, or the _substring_ `400/401/403/422` in `error.message`, and `apiClient.*` throws bare `Error(message)` with no status — so the mapping layer must classify explicitly.
5. **Synchronous `onMutate`** — applies the optimistic `collection.insert/update/delete` before the executor writes the outbox entry. The executor throws `OnMutateMustBeSynchronousError` otherwise.
6. **One write path** — a write routed through `executor.createOfflineAction` never invokes the collection's own `onInsert/onUpdate/onDelete` (the executor supplies its own `mutationFn`); restored optimism replays mutations directly into collections. Collection handlers and executor `mutationFns` are alternatives, never both.

## Phases

### Phase 0 — Remove PGlite, confirm Electric

1. Delete `apps/app/src/components/providers/local-postgres-provider.tsx` and `apps/app/src/lib/pglite-worker.ts`.
2. Add a boot wrapper that only calls `navigator.storage.persist()` (no mount point exists to replace) and mount it in `main.tsx`.
3. Remove `@electric-sql/pglite`, `@electric-sql/pglite-react`, `@electric-sql/pglite-sync` from `apps/app/package.json`, and `@electric-sql/pglite` from `optimizeDeps.exclude` in `apps/app/vite.config.ts`.
4. Confirm self-hosted Electric reachable at `SYNC_URL`; `apps/api/src/modules/sync.ts` unchanged.
5. Update the stale PGlite claims: `PRODUCT.md`, root `AGENTS.md` (file table), `apps/app/AGENTS.md` (tech stack, key files, providers list).

**Done:** app boots with no PGlite import; expense list renders from Electric.

### Phase 1 — Upgrade to TanStack DB 1.0 RC

Contract: `repos/tanstack-db/docs/guides/migrate-to-1-0-rc.md`. We are on `@tanstack/react-db@0.1.96` → `@tanstack/db@0.7.0`; the guide starts from `0.9.2`, so treat it as a superset of the changes that reach us.

1. **Bump together, from the `rc` tag**: `@tanstack/react-db`, `@tanstack/electric-db-collection` (`1.0.0-rc.1.5`, pulls `@electric-sql/client ^1.5.28`). `@tanstack/db` is transitive — `pnpm why @tanstack/db` must show one copy; dev builds throw `DuplicateDbInstanceError` otherwise.
2. **Dependency arrays on `useLiveQuery` are gone** (13 call sites in 8 files): `use-expenses.ts`, `use-incomes.ts`, `use-categories.ts`, `use-wallets.ts`, `use-recurring-bills.ts` (2), `use-events.ts` (4), `use-billing-projection.ts` (2), `use-expense-search.ts`. Switch to config-object form `useLiveQuery({ query })`; keep the old per-workspace scoping intent with `queryKey: [slug]` (or `[slug, eventId]` where the query filters by id). A nonempty `queryKey` is _required_ for `.fn.*` clauses and unhashable queries — we have none today.
3. **Handler returns no longer coordinate sync**: `onInsert/onUpdate/onDelete` return `Promise<void>`; the `{ txid }` matching strategy is deleted. Any handler must `await collection.utils.awaitTxId(txid, timeout?)` itself. This invalidates `docs/improve-tanstack-db.md` — rewrite it for the Phase 3 write path or delete it.
4. **`transaction.isPersisted.promise` → `transaction.when('settled')`** (first used in Phase 3).
5. **`cleanup()` now rejects with `CollectionHasSubscribersError`** while a live query reads the collection. `createCollectionFactory.clear()` (`create-collection-factory.ts:41,47`) and `clearExchangeRateCollection()` (`exchange-rate.ts:27`) must become async and call `cleanup({ dependents: true })`; `clearWorkspaceCollections` / `clearAllWorkspaceCollections` (`collections/index.ts`) become async and their callers (workspace switch, logout) must await them.
6. **Status vs health split**: hooks no longer expose `isError`; use `isLoadingError` (failed first load), `isCrashed` (local/storage failure), `isSyncError` (ready rows + sync trouble — keep the rows visible). `status: 'error'` no longer covers every failure. Re-check the `$slug/route.tsx` loader/`onError` path and any status switches.
7. **Retry is `reload()`** — `query.reload()` / `collection.reload()`. Cleanup-then-preload is no longer a legal retry while readers are mounted.
8. **Query-shape rules**: `use-wallets.ts` groups with `count()` (aggregate, so the grouping compiler is included — fine). Any future `.groupBy` without an aggregate needs `groupKeys()`; a child query returned from `.select()` needs `include()`; aggregate validation is stricter (mixed aggregate/non-aggregate expressions, `having`).
9. **Keys**: `getKey` must return `string | number` (ours do). Joined row keys are JSON arrays now — read `$key` instead of reconstructing a key; `collection.get()` on base collections is unaffected.
10. **Vite/dev**: add `@tanstack/browser-db-sqlite-persistence` to `optimizeDeps.exclude` when Phase 2 lands (dev `PersistenceUnavailableError` otherwise). `wa-sqlite.wasm` ships as a separate asset — confirm it matches the PWA precache globs in `vite.config.ts`.
11. **Fresh options per Collection**: RC rejects reusing mutable persisted/sync options across `createCollection` calls, and one `persistedCollectionOptions` object may create exactly one Collection — the factory must build options per slug, not hoist them.
12. **No-op sweep (verified, keep it that way)**: no `$synced`, no `SortedMap`, no `@tanstack/db-ivm` imports, no `.fn.*` clauses in the app.

| RC change                                                        | Where it lands                                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `useLiveQuery` deps removed                                      | 13 call sites, 8 files (above)                                                                                 |
| `cleanup()` subscribers guard                                    | `lib/collections/create-collection-factory.ts`, `lib/collections/exchange-rate.ts`, `lib/collections/index.ts` |
| hooks `isError` → `isLoadingError` / `isCrashed` / `isSyncError` | no current usage; guard rail for new code and `routes/_dashboard/$slug/route.tsx`                              |
| `{ txid }` → `awaitTxId`                                         | `docs/improve-tanstack-db.md`, Phase 3                                                                         |
| fresh options per Collection                                     | `lib/collections/create-collection-factory.ts` (Phase 2)                                                       |

**Done:** app runs on `1.0.0-rc` with unchanged behaviour — dashboard, transactions, wallets, bills, events, files all render and filter; a single `@tanstack/db` copy; `clearWorkspaceCollections` awaits cleanup; `pnpm lint` and typecheck clean.

### Phase 2 — SQLite persistence (read after reload, offline)

1. Add `@tanstack/browser-db-sqlite-persistence` + peer `@journeyapps/wa-sqlite` (`^1.4.1`) on top of `@tanstack/db-sqlite-persistence-core` — all `1.0.0-rc.1.5`. API: `openBrowserWASQLiteOPFSDatabase({ databaseName })` → `createBrowserWASQLitePersistence({ database, coordinator? })` → `persistedCollectionOptions({ ...electricCollectionOptions(...), persistence, schemaVersion })`, typed with the 4th generic `ElectricCollectionUtils<T>`.
2. Wrap each collection at the `createCollectionFactory` seam in `apps/app/src/lib/collections/create-collection-factory.ts`.
3. Name the database and collection `id` after the slug (e.g. `hoalu-<slug>`) so workspaces don't collide and resume is per-workspace. `exchange-rate` is a **global** collection (no slug, id `exchange-rates`) — keep it on its own file/database and out of the per-slug sweep.
4. **Decide the iOS storage path.** The shipped browser adapter is OPFS-only and fails closed with `PersistenceUnavailableError` when `navigator.storage.getDirectory` / `createSyncAccessHandle` are missing; `vfsName` is a label on the OPFS VFS, not a driver switch. Options: (a) ship OPFS and verify on a real iPhone; (b) write a custom IndexedDB `wa-sqlite` handle (`IDBBatchAtomicVFS`) and pass it as `database` — `createBrowserWASQLitePersistence` only needs `{ execute(sql, params) }`. Either way, build the fallback path (`mode: 'online-only'`).
5. Set `initialRender: { strategy: 'network-first', networkTimeoutMs }` — without it a restored collection stays `loading` until the network answers, and `$slug/route.tsx` awaits `preload()`.
6. Use `BrowserCollectionCoordinator` when more than one tab can open the same database (this is separate from the outbox leader election in Phase 4).
7. Resolve the bootstrap ordering: the adapter opens the database asynchronously, but `createCollectionFactory.get(slug)` is synchronous and called from loaders/render. Open the database before the router mounts (bootstrap gate), or make the factory async behind a preload step.
8. Keep `navigator.storage.persist()` + report `persisted()`; confirm quota/eviction behaviour after 7 days of inactivity for non-installed Safari tabs.

**Done:** reload offline renders previously synced rows; reconnect resumes incrementally (no full re-snapshot); an empty cache still waits for the network rather than showing an empty list.

### Phase 3 — Local-first writes (optimistic + durable outbox, online and offline)

Phases 3 and 4 are one phase: the executor supplies its own `mutationFn` for both the offline and the online-only path, so a collection-handler wiring would be thrown away immediately (Invariant 6). There is one write path, and it is the executor's.

1. **Server contract first** (it unblocks every client step):
   - Each POST/PATCH/DELETE in `apps/api/src/routes/{expenses,incomes,categories,wallets,events,recurring-bills}/` returns `pg_current_xact_id()::xid` **as text parsed to a number**, captured in the same transaction as the write (Invariant 3). Today only expenses returns a txid, it returns the wrong 64-bit value, and the other five resources do not wrap writes in `db.transaction` at all.
   - Accept a client-supplied `id` and `publicId` in the six `Insert*Schema`s (fall back to `generateId` when absent) and map a primary-key/unique violation to success (Invariant 1).
   - `DELETE` returns success when the row is already gone; `PATCH` accepts `isActive` on recurring bills so archive/unarchive stop being separate verbs.
2. **Units**: collections, the API, and the forms all use major units. Fix the existing 100× bug before moving the write path: `EditExpenseForm` seeds the form with minor units (`props.data.amount`) and posts them as major (`components/transactions/expense-form.tsx`), same class in `useSetUpRecurringBill` (`:411`). Delete the inverted unit table in `docs/improve-tanstack-db.md`.
3. Add `@tanstack/offline-transactions` (`1.2.1`, web entry; React Native peers are optional).
4. New `apps/app/src/lib/offline-executor.ts`: `startOfflineExecutor({ collections, mutationFns, storage })` keyed by slug (Invariant 2). Model the `mutationFns` on `repos/tanstack-db/examples/react-native/shopping-list/src/db/collections.ts`: iterate `transaction.mutations`, switch on `mutation.type`, call the API, then `await collection.utils.awaitTxId(txid)`. Collections keep **no** handlers (Invariant 6).
5. Per-slug outbox storage: `new IndexedDBAdapter(\`hoalu-offline-${slug}\`)` — the default database name is shared across all workspaces.
6. Route `mutations.ts` hooks through `executor.createOfflineAction` with synchronous `onMutate` (Invariant 5) — `collection.insert/update/delete` inside `onMutate`, haptics/toast immediately, `transaction.when('settled')` for the error toast. `apiClient.*` discards the HTTP status, so `mutationFns` call `honoClient.bff.*` where the status decides retry vs rollback.
7. Non-CRUD verbs: archive/unarchive become `isActive` updates; multi-step `useSetUpRecurringBill` (bill create + expense PATCH) and `useDuplicate{Expense,Income}` use multi-collection `createOfflineTransaction` or a dedicated server endpoint.
8. Surface pending/failed state via `transaction.when('settled')`; never block navigation on it. `executor.peekOutbox()` / `getPendingCount()` feed a queue badge if wanted.
9. Do not await `preload()` on the offline path — it can stay pending; screens read `status`/`health` instead.

**Done:** create/edit/delete reflect instantly with no spinner, online _and_ offline; offline write → durable outbox row; reload restores it; reconnect flushes FIFO deduped by key; rejection rolls back + notifies; editing an existing amount does not multiply it by 100.

### Phase 4 — Rollback, multi-workspace, multi-tab

1. Classify statuses into `NonRetriableError` vs retry (Invariant 4). The RC default policy only inspects `error.message` substrings, so an unclassified error retries forever.
2. Confirm optimistic state merges with Electric sync-back without flicker (the `awaitTxId` inside `mutationFns` handles this).
3. Multi-tab: the executor's leader election (Web Locks → BroadcastChannel) covers the outbox; `BrowserCollectionCoordinator` covers the shared database. Follower tabs use the online-only path and never enqueue.
4. Workspace switch/logout: `await clearWorkspaceCollections(slug)` (now async, `cleanup({ dependents: true })`); discard that slug's outbox (`executor.clearOutbox()` / delete `hoalu-offline-<slug>`) on workspace deletion only.

**Done:** two tabs don't double-flush; switching workspaces never cross-contaminates outboxes.

### Phase 5 — PWA / iPhone home screen

1. Confirm service-worker precache covers the app shell, `wa-sqlite.wasm`, and the OPFS worker chunk (`vite.config.ts` `workbox.globPatterns` already includes `wasm`).
2. Call `navigator.storage.persist()` on boot; report `persisted()`.
3. Confirm the outbox is IndexedDB and that the row-persistence path matches the Phase 2 decision.
4. Test "Add to Home Screen" on a real iPhone: offline create/edit, force-quit, reopen offline, reconnect sync.

**Done:** iPhone home-screen install keeps data across offline reloads and syncs on reconnect.

## File map

| Concern                   | Files                                                                                                                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove PGlite             | `apps/app/src/components/providers/local-postgres-provider.tsx`, `apps/app/src/lib/pglite-worker.ts`, `apps/app/vite.config.ts`, `apps/app/package.json`, boot wrapper in `apps/app/src/main.tsx`, stale docs (`PRODUCT.md`, both `AGENTS.md`) |
| 1.0 RC upgrade            | `apps/app/package.json`, 13 `useLiveQuery` call sites (8 files), `apps/app/src/lib/collections/{create-collection-factory,exchange-rate,index}.ts`, `docs/improve-tanstack-db.md`                                                              |
| Persistence               | `apps/app/src/lib/collections/create-collection-factory.ts`, `apps/app/src/lib/collections/*.ts`, `apps/app/vite.config.ts`, `apps/app/package.json`                                                                                           |
| Offline executor          | new `apps/app/src/lib/offline-executor.ts`, `apps/app/package.json`                                                                                                                                                                            |
| Optimistic writes         | `apps/app/src/services/mutations.ts`, `apps/app/src/lib/collections/*.ts`, `apps/app/src/components/transactions/expense-form.tsx` (units)                                                                                                     |
| Server txid + idempotency | `apps/api/src/routes/{expenses,incomes,categories,wallets,events,recurring-bills}/{index,repository,schema}.ts`                                                                                                                                |
| Read hooks                | config-object `useLiveQuery` only; no query-shape changes needed                                                                                                                                                                               |
| Electric proxy            | `apps/api/src/modules/sync.ts` unchanged                                                                                                                                                                                                       |

Follow repo conventions in `AGENTS.md` (path aliases, `.ts`/`.tsx` extensions, generated-file rules, Zod v4, `db:generate` → `db:migrate`).

## Definition of done

- [ ] No PGlite dependency remains.
- [ ] App runs on TanStack DB `1.0.0-rc` with one `@tanstack/db` copy.
- [ ] Offline reload renders previously synced data.
- [ ] Offline create/edit/delete: instant UI, survives reload, syncs on reconnect.
- [ ] Retries dedup by idempotency key; rejected writes roll back with a visible error.
- [ ] Works on iPhone (add-to-home-screen) with `persist()` and the chosen storage path.

## Known gaps — not yet phased

Recorded during review; each needs a decision before or during Phase 2/3.

1. **Offline shell**: `routes/_dashboard/route.tsx` gates on `authClient.getSession()` and `routes/_dashboard/$slug/route.tsx` awaits `ensureQueryData(getWorkspaceDetailsOptions(slug))`. Offline both fail → redirect to `/login` or `/`. Collection persistence alone cannot satisfy "offline reload renders synced rows"; the session and workspace details need a persisted query cache or a local-first fallback.
2. **Network-only reads**: wallets pages, unified bills, categories in the receipt dialog, files, attachments, tasks, members, workspace summary/logo. Swap to collections where an equivalent live query exists (`use-wallets.ts` already computes `total` locally).
3. **Attachments and AI calls are online-only**: S3 presign + upload (`mutations.ts` `useUploadExpenseFiles`), receipt scan and quick-entry parsing. Decide: queue, or block with a clear message.
4. **Testing**: `apps/api` and `apps/app` have no test runner; `@hoalu/finance` uses `bun test`. Pure pieces worth covering: mutation→payload mapping, retry classification, amount conversion, outbox replay ordering.

## Open questions (all resolved during the build)

1. ~~Exact browser persistence package name/API for wa-sqlite.~~ Resolved: `@tanstack/browser-db-sqlite-persistence@1.0.0-rc.1.5` + `@journeyapps/wa-sqlite`; OPFS-only, IndexedDB would need a custom handle (still open if iOS proves broken).
2. ~~How `@tanstack/offline-transactions` composes with `@tanstack/electric-db-collection`.~~ Resolved: the executor supplies its own `mutationFn` for both the offline and online-only paths, so collection handlers are never invoked; `awaitTxId` goes inside `mutationFns` (Invariant 6, Phase 3).
3. ~~Idempotency storage: client-generated id vs `idempotency_key` column.~~ Resolved: client id is the key; a PK conflict is a replay. Updates/deletes are idempotent by value.
4. Storage path on iOS: still the shipped OPFS adapter. Revisit only if a real device shows `PersistenceUnavailableError` — the app falls back to online-only (`getPersistence()` returns `null`) rather than crashing.

## Remaining work

- Real iPhone add-to-home-screen pass (offline create, force-quit, reopen, reconnect).
- Attachments and receipt scanning are online-only: `useUploadExpenseFiles` presigns against S3 and `use-receipt-scan` calls the AI endpoint. Decide queue vs. explicit "needs network" state.
- Files, tasks, unified bills, wallet pages and the receipt dialog still read through TanStack Query (network-only); swap to collections where a live query already exists.
- Multi-tab flush: the coordinator and leader election are wired but only single-tab was exercised.
