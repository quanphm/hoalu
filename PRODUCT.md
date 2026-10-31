# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the person who builds and runs Hoalu, tracking their own money. It is self-hosted and is not a service offered to other people. Nobody else uses it today (confirmed: solo, pre-users).

The multi-workspace system with members, roles, and invitations is therefore **not** a shared-money feature. Workspaces exist so one person can keep separate contexts apart. Which contexts those are is still undecided — do not assume household, team, or client work.

Because there are no external users, nothing in the interface is a public-facing commitment: labels, empty states, and flows can change freely when a change makes the tool better.

## Product Purpose

Hoalu is a personal ledger. It records spending and income against wallets and categories, keeps those numbers correct across currencies, and shows where the money went and what is still due.

It exists so that its owner can answer three questions without doing bookkeeping: what do I have, where did it go, and what is coming. Success is being able to open it daily, get that answer, and get out — including months later, when the history still has to be trustworthy.

*(Success stated from the product's own structure: a dashboard of cash flow, category breakdown, and upcoming bills exists only to answer those three questions. Confirmed as direction, not as fixed wording.)*

## Positioning

A neighbouring expense tracker could not truthfully copy Hoalu without rebuilding its stack and its arithmetic. All four of these are load-bearing, and none may be ranked below the others or traded away for polish:

1. **Offline-first, real-time sync.** The browser runs a real Postgres (PGlite) and syncs through Electric SQL. It works with no network and converges across devices when the network returns.
2. **Multi-currency truth.** Amounts in different currencies fold into one honest number through exchange rates. The conversion pipeline is the hard part, and every surface must share it rather than re-derive it.
3. **Bills as projection.** A bill occurrence is a calendar *period*, never a stored row. Editing a bill's due date therefore never orphans a payment already recorded against it. Paid status is derived, not stored.
4. **Zero-friction capture.** Command palette, quick-expense queue, natural-language parsing, and receipt OCR. The premise is that if logging costs more than a few seconds, the user stops logging, and the ledger dies.

## Operating Context

- Self-hosted personal deployment: Postgres, Redis, Electric, and a Caddy reverse proxy, run from `deployments/`.
- Used on the owner's own machine and phone; the app is installable as a PWA and is expected to hold up on a phone.
- Daily use is short and frequent: check the dashboard, log a transaction, look at what is due.
- Longer sessions happen on a desktop during organisation work — editing recurring bills, reviewing a period, cleaning up categories and wallets.
- The owner is also the developer, so the tool is expected to change as its owner's needs change.

## Capabilities and Constraints

**Confirmed capabilities.** Wallets; expense and income categories; transactions (an expense or an income); recurring bills; events with optional budgets and date ranges; multi-currency amounts with exchange rates; file attachments and receipt scanning; workspace members, roles, and invitations; API tokens; command palette; quick-expense queue; offline local Postgres with live sync; installable PWA.

**Terminology that is load-bearing.** *Workspace* (the container everything is scoped to), *wallet*, *category* (expense or income type), *transaction* (the umbrella for an expense or an income), *recurring bill*, *period* and *occurrence* (a bill's calendar key versus its rendered due date), *event*.

**Hard constraints.**
- All data is scoped by workspace. A surface that ignores the workspace is wrong, not merely incomplete.
- The client is a real database, not a cache over HTTP responses. Reads go through synced collections.
- The dashboard's read pipeline (currency conversion, range bucketing, period stats) is one shared deep module. Charts do not assemble their own.
- Amounts are redacted by default on first run (`redactedAmount$` defaults to on); visibility is an opt-in toggle, and that preference persists.
- The interface is English-only. No i18n framework is wired in.
- There is no marketing or landing surface: the only public entry points are sign-in, sign-up, email verification, password reset, and invitation acceptance.
- Every route sits behind authentication once a workspace is in play.

**Undecided, do not invent.** Whether Hoalu stays single-user forever; whether it is ever published for others; pricing, hosting, or licensing claims; which contexts workspaces are meant to separate; whether i18n will be added.

## Brand Commitments

The name is **Hoalu**. It has an icon and a full icon set, and no other identity constraint has been asserted: no stated voice, personality, tagline, or reference the owner has made binding. Absent a later commitment, treat tone as a blank rather than a settled brand.

## Evidence on Hand

- `media/dashboard.png` — a real screenshot of the dashboard, the only image asset representing the product.
- `README.md` — one paragraph describing the app and the local setup commands.
- Real product behaviour exists in code and can be inspected and run; screenshots can be captured from a running instance.

**Absences that future work must not fill by invention:** no customers, no testimonials, no case studies, no press, no benchmark numbers, no usage metrics, no pricing, and no user research. Do not write copy that implies any of these exist.

## Product Principles

1. **Own the ledger, do not rent it.** Self-hosted data, a local database in the browser, and masked amounts by default. The owner's financial history is not an input to somebody else's business.
2. **Truth is derived, never stored twice.** A calculation lives in one deep module — currency conversion, bill projection, period stats — so two screens cannot disagree. Duplicated arithmetic is the bug, even when both copies currently produce the same number.
3. **Capture costs near nothing.** Any friction added to logging a transaction has to be justified against the likelihood the user simply stops logging.
4. **It has to survive daily use, not a demo.** Offline, phone, a year of history, and a mistyped amount all have to work. Empty, huge, and malformed data are the normal case, not edge cases.
5. **Build for an audience of one.** No growth surfaces, no persuasion, no fabricated social proof. Earn quality through precision and speed, and be honest that this is a personal tool.
