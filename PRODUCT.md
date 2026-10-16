# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three confirmed audiences, often the same person at different moments:

- **Individuals tracking personal spending.** One person logging expenses and incomes in the moment, then reviewing charts, cash flow, and category breakdowns to understand where money went.
- **Households and couples sharing finances.** Two or more people running one budget. The product supports this directly: workspaces with `owner` / `admin` / `member` roles, email invitations, shared wallets and categories.
- **Multi-currency earners, expats, and travelers.** People whose money arrives and leaves in more than one currency, who need amounts recorded in their real currency and read in a common one.

Usage is mobile-first and in-the-moment (logging a purchase at the till, scanning a receipt), with desktop used for review and setup.

## Product Purpose

Hoalu is a personal and shared expense tracker. It records what was spent and earned, where it came from, and what is still owed — then shows the shape of that over time.

Success means the user logs spending without friction, trusts the numbers they see, and can answer "how much did I spend, and on what" for any period without opening a spreadsheet. Shared workspaces must make that true for more than one person at once, without either of them losing track of who changed what.

## Positioning

Three mechanisms together, each of which a neighboring tracker could not truthfully copy without rebuilding its data layer:

- **Offline-first, local-first sync.** Data lives in the browser (PGlite over IndexedDB) and syncs in real time through Electric SQL. The app is usable with no network; syncing is not a mode the user enters.
- **Multi-currency by default.** Every transaction carries its own currency, and foreign-exchange conversion is part of the read pipeline rather than a reporting afterthought. The recorded currency is never overwritten by a converted display value.
- **AI receipt scanning and quick capture.** Receipt OCR and AI-assisted parsing feed a background queue, so a purchase can be captured in seconds and tidied later.

## Operating Context

- Runs as an installable PWA in the browser, standalone on mobile, with iOS safe-area and status-bar handling; desktop Safari/Chrome is the review surface.
- Capture happens away from a desk: quick expense entry, receipt photos, haptics and sound feedback, keyboard shortcuts and a command palette for people at a keyboard.
- Review happens on the dashboard: date-range filters, expense/income tabs, category breakdowns, cash-flow over time, upcoming and overdue bills, wallet balances.
- Work is organized per workspace. A user may hold several (personal, household, side project) and switches between them; each workspace gets its own default wallet and category set at creation.
- Local development runs behind Caddy at `https://hoalu.localhost` with the API at `/api` and docs at `/api/docs`.

## Capabilities and Constraints

Confirmed functionality:

- Workspaces with membership and roles (`owner`, `admin`, `member`), email invitations, and per-workspace scoping of all data.
- Expenses and incomes, each with a title, description, amount + currency, date, wallet, category, optional event, repeat, and file attachments.
- Categories split by type (`expense` / `income`); wallets typed as cash, bank account, credit card, debit card, or digital account, with derived balances.
- Events as dated buckets for grouping spending (a trip, a move, a renovation).
- Recurring bills: a bill definition (amount, frequency, due day/month) plus expenses linked to it as payments. Occurrences are a **derived projection keyed by period**, never stored — so editing a bill (due day 5 → 10) moves its rendering without orphaning a payment already recorded against it. Paid status is derived, not stored.
- Exchange rates with FX conversion applied across the dashboard read pipeline.
- Files / receipt attachments stored on S3-compatible storage.
- A global **redact amounts** toggle, persisted per user, for showing the app in company.
- Background job queues for tasks, quick expenses, and receipt scanning; offline-tolerant by design.

Constraints and undecided facts:

- **English only.** There is no i18n layer (no i18next / react-intl / locale files); copy is written directly in components. Introducing translation infrastructure would be a product decision, not a refactor.
- **The stack is fixed:** React 19 + Vite, TanStack Router / Query / DB / Form / Table / Virtual, Electric SQL + PGlite, Hono API, Drizzle + PostgreSQL 17, Tailwind v4, `@hoalu/ui`, oxlint + oxfmt.
- **Web only.** It is a PWA and mobile web is the primary form factor, but there is no native iOS or Android app; the design language is web, not platform-native.
- Numeric fields arrive from Electric SQL as strings and are coerced at the boundary; API routes are documented with OpenAPI and validated with Zod v4.
- No pricing, plan tiers, or billing flow exists in the codebase.

## Brand Commitments

- **Name:** Hoalu. The in-app wordmark reads `HoaLu.app`; the document title and PWA manifest read `Hoalu`. Both spellings are in use today — treat the inconsistency as existing state, not as license to invent a third.
- **The visual world is OC-2, dark only (set 2026-10-16).** There is exactly one theme, ported from OpenCode's OC-2 token system in `packages/themes/src/colors/oc2.css`: a hue-free grey ramp, one accent (`blue-600` `#3b5cf6`), a 19-step alpha ramp for borders and overlays, and three elevation levels. Those primitives feed Hoalu's own semantic token names (`--background`, `--card`, `--border`, …), which stay the component-facing API. Light mode, additional themes, and runtime theme resolution are out of scope; `.dark` on `<html>` exists only so the handful of `dark:` utilities stay meaningful. See `DESIGN.md` for the rules that hold this together.
- **Depth is hairlines, not blur.** A 1px translucent border, a `0 0 0 .5px` white ring drawn as a shadow, a top-edge catchlight, and percentage-white hover overlays — never a colour-mixed background, never a soft drop shadow. Change depth in `packages/themes/src/foundations.css` and `--elevation-*`, not per component.
- **No colours outside the OC-2 ramps.** Category, wallet, chart and state colours all resolve to `--oc2-*` steps (`apps/app/src/helpers/colors.ts`). Tailwind's default palette (emerald, teal, violet, amber, slate, stone, lime) must not leak back in. The one compromise: `stone` has no warm grey in OC-2 and reads as the deep end of `yellow`.
- **Geist Sans and Geist Mono stay** (self-hosted in `apps/app/public/fonts`), as do the Phosphor / Meteocons / Nucleo / Tabler icon sets, motion via `motion`, and the sound-effect and haptic feedback layers. This change replaced colour, depth and the navigation shell — not type, motion, iconography or tone.
- **Shell: there is no sidebar (set 2026-10-16).** Navigation is a slim top bar (logo, workspace switcher, search, account) plus a horizontal underline tab strip. The mobile layout keeps its bottom nav. `packages/ui` no longer ships a sidebar component.
- **Palette truth:** `--background` `#161616` (the recessed shell), `--card` `#242424` (the content surface), `--border` `rgba(255,255,255,.10)`, `--primary` `#3b5cf6`, `--foreground` `#fafafa`. The `theme-color` meta in `apps/app/index.html` matches this; the earlier drift between the HTML hints (`#f9f7f3` / `#242a3a`), `THEME_COLORS`, and the CSS is resolved by deletion, not reconciliation.
- **A playful register is already load-bearing:** the robot app mark, weather-and-time-aware greeting, and delightful motion and micro-feedback. Keep it; don't sand it off into neutral enterprise tone.
- **Voice:** plain, second-person, sentence-case, low-hype. Errors name what happened ("Something went wrong." + the underlying message) rather than apologizing or speculating.

## Evidence on Hand

- `media/dashboard.png` — the dashboard screenshot used in the README; the only committed visual of the product.
- `apps/app/public/images/` — favicon SVG/ICO/PNG, apple-touch-icon, and 192/144/512 PWA manifest icons.
- `apps/app/public/fonts/` — self-hosted Geist Sans, Geist Mono, and Redacted Script (a real dependency of the redact-amounts feature).
- `AGENTS.md` at the repo root and in `apps/api`, `apps/app` — detailed, current, and treated as authoritative for architecture, conventions, and the recurring-bill data model.
- `docs/` — internal migration planning notes (Effect TS, TanStack DB); engineering history, not product copy.

Absences future work must not fill by invention: there is no marketing site, landing page, pricing page, testimonial, customer logo, benchmark, case study, or press mention. No DESIGN.md exists yet; the visual world lives in CSS, tokens, and components.

## Product Principles

1. **Local-first is the promise, not an implementation detail.** Anything that needs a network round trip to show users their own money is a regression. Offline is the normal case, not a degraded one.
2. **Shared money stays private.** Everything is workspace-scoped; money UI is built for a screen someone else can see, which is why redaction exists as a first-class toggle.
3. **Every amount is currency-true.** The recorded currency is preserved exactly; conversion exists only to make different currencies comparable when reading.
4. **Derive state, never duplicate it.** Paid status, wallet balances, and bill occurrences are computed from primitives. A second copy of a truth is a bug waiting for an edit.
5. **Capture must survive interruption.** Logging a purchase can be abandoned at any step — so capture is optimistic, queued, and correctable later, never a blocking form.
