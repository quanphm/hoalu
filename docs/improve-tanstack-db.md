# Superseded — see `docs/offline-first-plan.md`

This document described wiring optimistic mutations by returning `{ txid }` from
`electricCollectionOptions` handlers. That protocol was removed in TanStack DB
`1.0.0-rc`: handlers return `Promise<void>` and must call
`await collection.utils.awaitTxId(txid)` themselves.

The write path actually shipped is different again, and is documented in
`docs/offline-first-plan.md` (Phase 3):

- collections declare no `onInsert`/`onUpdate`/`onDelete` handlers;
- every write goes through `@tanstack/offline-transactions`
  (`apps/app/src/lib/offline/executor.ts`), which applies the optimistic row in a
  synchronous `onMutate`, persists it to an IndexedDB outbox, and calls the API
  from a named mutation function;
- the server returns `pg_current_xact_id()::xid` and the mutation function awaits
  `collection.utils.awaitTxId(txid)` so the optimistic row is not dropped before
  Electric syncs it back.

Amount units: collection rows, API payloads and forms all use **major** units
(e.g. `10.50`). The table in the previous revision of this document said minor
units and was wrong; `convertTransactions` in
`apps/app/src/services/dashboard-model.ts` converts the synced row to minor units
for display and comparisons.
