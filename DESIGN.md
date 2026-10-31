---
name: Hoalu
description: A dense, quiet personal ledger — flat bordered surfaces, tabular money, one midnight world, no persuasion.
colors:
  # Primary — the one action color
  signal-indigo: "#5e6ad2"
  # Midnight — the only world
  midnight-page: "#0f1012"
  midnight-card: "#16171a"
  midnight-raised: "#1b1c1f"
  midnight-line: "#232428"
  midnight-ink: "#f7f8f8"
  midnight-muted: "#1a1b1f"
  midnight-accent: "#232428"
  midnight-input: "#2a2b30"
  midnight-ash: "#8a8f98"
  # Semantic
  alert-crimson: "oklch(63.7% 0.237 25.331)"
  income-emerald: "oklch(69.6% 0.17 162.48)"
  notice-amber: "oklch(76.9% 0.188 70.08)"
  info-azure: "oklch(62.3% 0.214 259.815)"
typography:
  money-display:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "27px"
    fontWeight: 500
    lineHeight: "36px"
    letterSpacing: "-0.025em"
  money-inline:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "12.6px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "21.6px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "14.4px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0em"
  label:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "12.6px"
    fontWeight: 500
    lineHeight: "17.3px"
    letterSpacing: "0em"
  micro:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "10.8px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  frame: "18px"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.signal-indigo}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.lg}"
    padding: "5px 11px"
    height: "36px"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: "{colors.midnight-card}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.lg}"
    padding: "5px 11px"
    height: "36px"
  button-ghost:
    backgroundColor: "{colors.midnight-page}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.lg}"
    padding: "5px 9px"
  card:
    backgroundColor: "{colors.midnight-card}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.lg}"
    padding: "16px 0px"
  input:
    backgroundColor: "{colors.midnight-card}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.md}"
    padding: "0px 11px"
    height: "34px"
  badge-category:
    backgroundColor: "{colors.midnight-muted}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.sm}"
    padding: "0px 3px"
    height: "22px"
  stat-readout:
    backgroundColor: "{colors.midnight-card}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  table-row:
    backgroundColor: "{colors.midnight-card}"
    textColor: "{colors.midnight-ink}"
    padding: "12px 16px"
---

# Design System: Hoalu

## Overview

**Creative North Star: "The Quiet Control Room"**

Hoalu looks like a room built for monitoring, not for selling, and the room is always at night. One near-black world: page at #0f1012, cards one step lifted at #16171a, single-pixel hairlines instead of shadows or color blocks. There is no light mode and no theme switch — one palette, so contrast, chart hues, and the weight of every hairline are tuned once instead of kept in parity across variants. Nothing in the chrome is saturated except one indigo action. The numbers are the only thing allowed to be large.

The density is the point. Type is deliberately smaller than a typical web app — body copy is 14.4px, labels are 12.6px, and the smallest micro-labels are 10.8px — so that a year of transactions, a bill schedule, and four readouts can share one screen without scrolling. Rows are 36px, cards have 16px of internal rhythm, and every table of money is set in Inter with tabular figures so digits line up in a column and never jitter as values change.

The personality is restraint plus exactness. There is no gradient hero, no greeting card illustration, no icon in a pastel circle. Where a generic dashboard would reach for decoration, this system reaches for a delimiter: a hairline, an uppercase micro-label, a hatch pattern that says _this value was truncated_, a `≈` that says _this number was converted_. Precision is the aesthetic.

**Key Characteristics:**

- Flat, bordered surfaces on a near-black page; depth reserved for genuinely floating layers.
- Tabular money as the only display-scale typography in the app; one face sets the whole product.
- One saturated signal per view; everything else is ink, ash, or hairline.
- Density over comfort: 12.6px labels, 36px rows, micro-labels at 10.8px uppercase.
- One world only — midnight — with no theme switch, no OS-following, and no second palette to keep in parity.
- Honest encodings: hatched bars for clipped values, `≈` for converted amounts, asterisks for redacted ones.

## Colors

A two-family palette: a cool indigo signal on near-black slate, plus semantic hues used almost exclusively inside data visualisation and alerts.

### Primary

- **Signal Indigo** (#5e6ad2): the single action color. Primary buttons, the active workspace logo, focus ring, and the first data color. It appears on roughly one element per view; its scarcity is what makes it read as "the thing to press". Against near-black it is the brightest chroma on screen, which is why the invariant _one high-contrast action per view_ costs nothing to hold.

### Neutral

- **Midnight Page** (#0f1012): page background, the sidebar rail, the toolbar, the room itself.
- **Midnight Card** (#16171a): card, table, and input fill — one step lifted from the page, so a card separates by tone _and_ by its hairline rather than by a second border.
- **Midnight Raised** (#1b1c1f): popovers, dropdowns, menus — the layer above a card.
- **Midnight Ink** (#f7f8f8): all body text and every monetary figure. Near-white, never pure white.
- **Midnight Ash** (#8a8f98): eyebrows, descriptions, secondary metadata, uppercase micro-labels, icon default.
- **Midnight Muted** (#1a1b1f): secondary and muted fills — table group headers, neutral chips, hover on ghost controls.
- **Midnight Accent** (#232428): hover/pressed fill for ghost and outline controls, active nav item.
- **Midnight Line** (#232428): the primary hairline — every card border, table divider, toolbar rule.
- **Midnight Input** (#2a2b30): a touch lighter than the hairline, used only on form control outlines.

### Semantic

- **Alert Crimson** (oklch(63.7% 0.237 25.331)): overdue bills, destructive actions, negative period totals, downward deltas.
- **Income Emerald** (oklch(69.6% 0.17 162.48)): upward deltas, the cash-flow trend line when net positive, the area-chart stroke.
- **Notice Amber** (oklch(76.9% 0.188 70.08)) / **Info Azure** (oklch(62.3% 0.214 259.815)): queue and job states, validation severity. Rare.

### One World

Midnight is the only theme, and it is not a switch. The palette is declared once in `packages/themes/src/colors/default.css` and `class="dark"` is fixed on `<html>` in `apps/app/index.html`, so `dark:` variant utilities resolve with no runtime toggle. The theme picker, its `Shift+D` hotkey, the OS-scheme listener, and the light and creamy palettes are all gone; `color-scheme: dark` is set on the root so native controls, scrollbars, and form widgets match. Charts follow the one palette — expense bars bright crimson, the cash-flow line emerald, both against #0f1012.

### Named Rules

**The Single Signal Rule.** Exactly one saturated, high-contrast action per view. If two controls compete for the indigo, one of them is a secondary outline.

**The Money Is Ink Rule.** Amounts are set in Midnight Ink, never tinted to show direction — the `-`/`+` sign, the `≈` prefix, and column position carry meaning. Crimson on a number is reserved for two cases only: an overdue bill amount, and a period total that ends negative. Anything else red on money is a bug.

**The Never-Invent-A-Rate Rule.** When no exchange rate exists, show the original amount in its own currency. Never render a converted figure you had to guess, and never a `≈0`.

**The Anchor-Before-Accent Rule.** A new color must earn its place in a semantic role (state, chart series, or alert) before it is used decoratively. The palette has three neutral families and does not need a fourth.

## Typography

**Display Font:** Inter (12.6px–27px, weight 500), self-hosted variable file
**Body Font:** Inter (Arial fallback), variable weight 100–900, optical sizing on
**Label:** Inter at 12.6px/500, or 10.8px/500 uppercase with 0.05em tracking

**Character:** One face, one register. Inter carries prose, labels, headings, and figures alike — there is no second typeface anywhere in the product. Money stays comparable not by switching to a mono cut but by tabular numerals, set globally on `body` (`font-variant-numeric: tabular-nums lining-nums`), so a column of amounts lines up and a figure never jitters as it changes. The face ships from `apps/app/public/fonts/inter/` as a local variable woff2 and is preloaded in `index.html`: no webfont CDN, no external request, so the instrument panel sets identically offline.

The scale is unusually compressed. Base is 14.4px, and the two smallest steps exist because chips and micro-markers need them: `2xs` at 9.2px for category chips and currency suffixes, `xs` at 10.8px for uppercase region markers. Above base the scale turns geometric toward a single display step — `lg` 16.2px, `xl` 18px, `2xl` 21.6px, `3xl` 27px — and nothing larger is needed, because long-form copy is rare enough that there is no reading column to protect. Type does not change at breakpoints; only control heights do.

### Hierarchy

- **Money display** (Inter 500, 27px/36px, −0.025em): the one number a card exists to show — cumulative net, period expenses, a stat cell. Never more than one per card.
- **Title** (Inter 600, 21.6px/32px, −0.025em): page-level entry titles, such as the borderless "Untitled expense" input.
- **Body** (Inter 400, 14.4px/24px): card eyebrows ("Cumulative Net"), default interface copy.
- **Label** (Inter 500, 12.6px/17.3px): buttons, field labels, table header cells, muted descriptions.
- **Micro** (Inter 500, 10.8px/16px, uppercase, 0.05em): section markers (`DETAILS`, `NOTE`, `RECEIPT & IMAGES · 0`), alert band labels (`OVERDUE · 1`), sidebar group names.

Deltas, table figures, and inline amounts use Inter at 12.6px/500 with tabular numerals so that a column of money has a fixed rhythm; the compact `2xs` step (9.2px) appears on category chips and on the currency suffix of a decimal figure.

### Named Rules

**The Figures Are Tabular Rule.** Any figure a user might compare down a column — amounts, deltas, percentages, counts, dates in tables — carries `font-variant-numeric: tabular-nums` (set globally on `body`). Every step of the scale is the same face; what distinguishes a figure is its alignment and its size, never a font switch. A money column that falls back to proportional digits is a defect.

**The Upcase-Only-For-Markers Rule.** Uppercase is reserved for micro labels that mark a _region_ of the interface. Never uppercase a sentence, a button, or a heading.

**The One Display Number Rule.** Each card has at most one display-scale figure. Everything else in that card is label-sized or smaller. Two 27px numbers in one card means the card is doing two jobs.

## Layout

A fixed 224px navigation rail plus a fluid content area, both full-bleed to the viewport edges. There is no centered container: the page fills the window, and cards do the framing. The rail carries the workspace switcher, a search trigger, then three labelled groups (Finance, Resources, Settings) under 10.8px uppercase group labels, and a pinned footer with the account menu and version.

Content is a 24-column CSS grid (`SectionContent columns={24}`) with 16px page padding and 16px gutters, so panels can span 8/8/8, 16/8, or 8/16. Below `lg` (1024px) the grid collapses to 2, then 3, then 4 equal columns; at `md` (768px) gutters tighten to 12px. Horizontal density is generous, vertical density is not: cards sit 16px apart with 16px internal padding, table rows are 12px/16px, and stacked sections rely on hairline dividers rather than extra space.

Responsive behavior is structural, not just fluid. At `sm` (640px) and below the rail is replaced by a bottom tab bar (Dashboard, Transactions, Settings) with a 64px bottom padding reserve, the header becomes a workspace pill plus a single search icon button, and the toolbar splits into two rows: title and date controls, then a horizontally scrolling action row. The same `useLayoutMode()` decision drives per-surface reorganization — for example the transaction list drops its separate income and expense columns for the two-column mobile layout.

Breakpoints: `xs` 0, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

Control sizing runs opposite to the usual instinct: the base sizes are the _touch_ sizes and they shrink at `sm`. Buttons run 24–40px by size (36px default, 32px for icons); inputs are 34px on mobile and 28px at `sm`; category badges are 22px on mobile and 18px at `sm`. On coarse pointers, buttons and badges gain an invisible 44×44px hit area via a `::after` overlay, so compact visuals never cost tap accuracy.

### Named Rules

**The Full-Bleed Rule.** No centered max-width container. Layout fills the viewport and the grid does the constraining; a centered column is a marketing pattern, not a ledger one.

**The Touch-First Sizes Rule.** Controls are sized for a thumb at base, then tightened for a cursor at `sm` and above. Growing controls only at breakpoints means desktop-sized hit areas on phones — do not do it.

## Elevation & Depth

The system is **tonal and bordered, with ambient lift on primary surfaces**. Cards sit on the page with a 1px Midnight Line border and a soft ambient shadow at 5% opacity — enough to read as a sheet laid on a dark surface, never enough to look like a card floating in a marketing page. Depth is also carried by background stepping: cards are #16171a against a #0f1012 page, so a card lifts by tone alone before any shadow.

Genuinely floating layers — dialogs, dropdowns, popovers, toasts — switch to a _structural_ shadow (`shadow-lg`, and `shadow-lg/5` for toasts) plus the same border, so a floating surface is always legible against a busy chart. Inputs use a different, finer device: a 1px inset hairline drawn by a `::before` ring (white at 8%), which is what gives fields a crisp milled edge without a visible shadow.

As implemented today, cards carry only the border and read as fully flat; the ambient shadow is the stated intent and the token already exists (`--shadow-xs`: `0 1px 3px 0 hsl(0 0% 0% / 0.05)`). Applying it to `[data-slot=card]` is the one change that aligns the implementation with this doctrine.

### Shadow Vocabulary

- **Ambient card** (`0 1px 3px 0 hsl(0 0% 0% / 0.05)` = `--shadow-xs`): resting state of cards and frame panels.
- **Inset hairline** (`inset 0 1px 0 rgba(0,0,0,0.04)`, inverted to white 6–8% in dark, via `::before`): inputs, buttons, toasts — the milled edge.
- **Floating** (`0 1px 3px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1)` = `--shadow-lg`): dialogs, dropdowns, sheets.
- **Whisper float** (`shadow-lg/5`): toasts, where the scrim and border do most of the separating.

### Named Rules

**The Paper-On-Paper Rule.** Resting surfaces get at most 5% black shadow. If a card looks _raised_, the shadow is too strong; the border should be doing the work.

**The Float-Only Shadow Rule.** Structural shadows belong exclusively to layers that overlap other content. A static card or toolbar never gets `shadow-lg`.

## Shapes

Rounded rectangles, consistently, with the radius scale driven by a single variable: `--radius` is 10px, giving 6px / 8px / 10px / 14px for sm/md/lg/xl. Cards, dialogs, and primary buttons take `lg`; inputs, secondary buttons, and selects take `md`; chips and small badges take `sm`. Frame panels — the inset container that groups sibling panels — step beyond the scale to `xl + 4px` (18px).

The recurring corner detail is a **double edge**: a 1px border plus a `::before` ring inset by 1px and rounded to `radius − 1px`, clipped with `bg-clip-padding`. This keeps the border crisp while allowing an inner highlight, and it is why corners look machined rather than merely rounded. Nothing is fully square, nothing is a pill, and organic or blob shapes do not exist anywhere in the system.

## Components

### Buttons

- **Shape:** rounded-lg (10px), 1px border always present, 36px tall by default, 5px/11px padding.
- **Primary:** Signal Indigo fill with a border of the same value, white text, label size (12.6px/500). One per view.
- **Hover / Focus:** background drops to 90% opacity (`bg-primary/90`) — a darkening, not a tint change. Focus is a 2px ring in Indigo offset 1px from the border, `ring-offset-1`, never a glow. Press is `active:scale-[0.97]` over 150ms ease-out.
- **Outline / Ghost:** outline is Midnight Card fill with a Midnight Input border and `accent/50` hover; ghost is borderless with a Midnight Accent hover. Both drop the border to transparent rather than changing text color.
- **Sizes:** 24px (xs) · 28px (sm) · 36px (default, lg) · 40px (xl) · 32px (icon) · 28px (icon-sm) · 36px (icon-lg).
- **Touch:** on coarse pointers an invisible `::after` expands every button to at least 44×44px.

### Cards / Containers

- **Corner Style:** rounded-lg (10px).
- **Background:** Midnight Card (#16171a), one step lifted from the #0f1012 page — a card is defined by its hairline plus that step of tone, never by a lighter fill alone.
- **Shadow Strategy:** ambient 5% at rest (see Elevation & Depth); never `shadow-lg`.
- **Border:** 1px Midnight Line, all sides.
- **Internal Padding:** 16px horizontal (`px-4`), 16px vertical block padding, 24px between header and content, 4px between title and description.
- **Header rhythm:** eyebrow label (14.4px muted) → optional display figure → optional delta · action cluster anchored top-right in a `[1fr_auto]` grid.

A sibling pattern, **Frame**, nests panels inside a tinted shell (`bg-muted/60`, 18px outer radius, 4px padding): use it when two panels genuinely belong together, not as a generic wrapper.

### Inputs / Fields

- **Style:** Midnight Card fill, 1px Midnight Input border, rounded-md (8px), 34px tall on mobile and 28px at `sm`, placeholder at 72% of Midnight Ash. Wrapped in a span that carries the state classes so any leading/trailing addon shares the ring.
- **Focus:** border shifts to the ring color plus a 3px `ring-ring/24` halo. The inset hairline disappears while focused.
- **Error:** `aria-invalid` moves the border to `destructive/36` and adds a `destructive/16` halo — a tinted version of the focus treatment, so error and focus are the same shape, different hue.
- **Disabled:** 64% opacity, inset hairline removed.
- **Autofill:** a 4% ink wash rather than the browser's blue.

### Chips (Category & Wallet Badges)

- **Category chip:** `2xs` (9.2px) text on a tinted fill from a fixed 10-color map (red, green, teal, blue, yellow, orange, purple, pink, gray, stone), each with a coloured emoji prefix and a border one step darker than its fill. In dark mode the fill drops to 15% alpha with a 30% border. Selected state deepens fill and text together.
- **Wallet chip:** a 6px coloured dot plus the wallet name in Label size, with the dot hue keyed to wallet _type_ (cash amber, bank blue, credit lime, debit violet, digital orange).
- **Shape:** rounded-sm (6px), 22px tall on mobile / 18px at `sm`, 3px horizontal padding.
- **Rule:** chips carry _category_ identity, never _state_. Status is the job of semantic tints (crimson overdue band, amber queue chip).

### Navigation

A 224px rail one step off the page (#121316) with a 1px right hairline. The workspace switcher at the top is a 36px outline row with a rounded logo tile, name, and caret. Nav items are 12.6px/500 with 16px Phosphor icons, rounded-md, transparent by default, Midnight Accent when active with Midnight Ink text and icon — the _same_ treatment as an outline button hover, which is what makes the rail feel like one control surface. Below `sm` the rail is replaced by a bottom tab bar with icon-over-label pairs and 64px of bottom padding on main content so the last row is never obscured.

**Icon keys.** Every glyph in the app is Phosphor at the regular weight — 16px in the rail, 24px in the tab bar, 14px inside buttons — with one glyph per noun, reused wherever that noun appears, so the rail is readable before the labels are: Dashboard `SquaresFour`, Transactions `Receipt`, Recurring Bills `ArrowsClockwise` (the repeat, not a calendar — Events owns the calendar), Events `CalendarStar`, Categories `Tag`, Wallets `Wallet`, Files `Images`, Workspace `Buildings`, Members `Users`, search `MagnifyingGlass`, account Preferences `SlidersHorizontal`, app Settings `GearSix`, close `X`, dates `CalendarBlank`, deltas `TrendUp` / `TrendDown`, submenu chevron `CaretRight`, scan `Scan`. Phosphor is the only family left: the hand-copied Tabler set that used to sit beside it was removed, because a 2px-stroke Tabler glyph next to Phosphor's regular weight reads as a mistake at 14–16px. There is no second icon library to reach for.

### Money Readout (signature)

The unit the whole product is composed from: a muted eyebrow, then a 27px/500/−0.025em figure in tabular Inter, then a delta line pairing an arrow icon (↗ for increase, ↘ for decrease, colour matching the semantic hue) with the percentage and a comparison period in Midnight Ash. The figure is never coloured; the delta carries the direction. In the stat strip these readouts sit in a row separated by vertical hairlines rather than as individual bordered cards.

### Upcoming Bill Row (signature)

A full-width row: title in 12.6px/500, then a metadata line composed of the category emoji, category name, separator dot, status, due date, and lateness ("· due Oct 25 · 6 days late" with the lateness clause in crimson). The right side holds the tabular amount and a kebab menu. Overdue items are lifted out of the list into an alert block: `destructive/8` fill with a `destructive/20` border, rounded-lg, an uppercase `OVERDUE · 1` band across the top, and the count and total aligned right. Urgency is expressed as an _enclosure_, not as a louder row.

### Command Palette (signature)

A centred 660px floating sheet, rounded-xl, on a dark scrim with backdrop blur — the page stays visible and legible behind it. Structure: search field, then grouped results under 10.8px muted group headings ("Recent Expenses", "Upcoming Bills", "Actions"), each row a title with a muted description and right-aligned metadata (category chip, date, tabular amount). The selected row takes a Midnight Muted fill, no border. The footer is a persistent keyboard legend of `kbd` chips (↑↓ Navigate · ↵ Open · Esc Close) on Muted fill.

### Data Table (signature)

Full-bleed inside a bordered, rounded container. Day-group headers span the row in Midnight Muted with the weekday, date, and that day's net at the far right in crimson when it ends negative. Rows are 36–44px, 12px/16px, separated by single hairlines, with the title in 14.4px/500 followed inline by a truncated muted description. Empty cells render an em dash in Midnight Ash rather than collapsing the column. Column widths are declared as CSS variables (`--name-size`, `--date-size`, `--amount-size`, `--category-size`, `--wallet-size`) so a table type can be retuned per surface.

## Do's and Don'ts

### Do:

- **Do** keep one indigo action per view and make every other control an outline or ghost.
- **Do** set every comparable figure in Inter with tabular numerals; the `2xs`–`micro` steps are correct for chips and markers.
- **Do** reach for a 1px Midnight Line border and 5% ambient shadow before reaching for a new fill colour.
- **Do** use uppercase 10.8px/0.05em micro-labels to mark regions (`DETAILS`, `NOTE`, `OVERDUE · 1`), and nothing else.
- **Do** encode missing certainty in the glyph: hatched bars for axis-clipped values, `≈` for converted amounts, `*****` for redacted amounts, `—` for empty cells.
- **Do** target 44px touch areas via the existing `pointer-coarse::after` pattern when a control is visually smaller than that.
- **Do** keep the single palette honest: a new surface is a step of midnight tone, not a new hue.

### Don't:

- **Don't** introduce consumer-app gloss: no gradient hero cards, no icon-in-a-pastel-circle KPI tiles, no illustration or mascot inside the product chrome. This is a ledger, not a landing page.
- **Don't** tint an ordinary amount red to mean "expense". Direction belongs to the sign; crimson belongs to overdue items, destructive actions, and periods that end negative.
- **Don't** let a column of figures fall back to proportional digits, and don't reintroduce a second typeface to get alignment; tabular numerals do that job in Inter.
- **Don't** add a second display-scale number to a card, or grow body copy past 14.4px to "improve readability" — the density is a feature and shrinking the viewport to fewer rows is the better trade.
- **Don't** use `shadow-lg` on static surfaces, and don't increase the resting card shadow above 5% black.
- **Don't** centered-container the layout. Full-bleed grid only.
- **Don't** add motion without a reduced-motion path: the system currently ships `active:scale-[0.97]`, 150–200ms transitions, and scale/opacity dialog entrances with no `prefers-reduced-motion` guard anywhere. Fix the guard as you touch motion, rather than adding more uneased movement.
- **Don't** wire in the dormant Redacted Script webfont for masking; redaction is literal asterisks in the money component, and that is what users already recognise.
