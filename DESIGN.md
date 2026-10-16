---
AI_CONTEXT: true
LAST_UPDATED: 2026-10-16
SOURCE_OF_TRUTH: packages/themes/src/colors/oc2.css
---

# DESIGN.md

The visual rules behind Hoalu. This file is the contract; the token files are the
implementation. When they disagree, the tokens win and this file is wrong.

**The world:** OC-2, dark only. Ported from OpenCode's OC-2 token system — a
hue-free grey ramp, one accent, a 19-step alpha ramp, three elevation levels. There
is one theme and nothing resolves at runtime.

## 1. Colour

### Structure

```
packages/themes/src/foundations.css   shape and type: radius, spacing, tracking, fonts
packages/themes/src/colors/oc2.css    block A: OC-2 primitives, copied verbatim
                                      block B: Hoalu's semantic tokens, dark values only
packages/themes/src/theme.css         @theme inline — exposes those names to Tailwind
```

`--oc2-*` is internal. Components speak Hoalu's semantic names (`bg-card`,
`border`, `text-muted-foreground`, `text-faint`), which stay the API. Block A is
copied byte-for-byte from upstream so an upstream change is a re-copy rather than a
translation.

### The three rules

1. **One hue-free neutral ramp, one accent.** `--primary` (`blue-600` `#3b5cf6`)
   appears on toggles, active states, focus rings and the primary button; `--success`
   on progress bars and positive change. Nothing else is saturated. If a screen has
   three bright colours on it, one of them is wrong.
2. **One accent, one alpha ramp.** Borders are `rgba(255,255,255,.10)`, field
   borders `.14`, hover fills 6%, pressed 10%, scrim 60% black. A translucent border
   reads correctly over every surface, which is why borders are alpha and not hex.
3. **No foreign hues.** Category, wallet, chart and state colours resolve to
   `--oc2-*` steps only (`apps/app/src/helpers/colors.ts`). Tailwind's default
   palette must not leak back in.

### Surfaces, ascending as they come forward

| Token                      | Value                 | Role                                           |
| -------------------------- | --------------------- | ---------------------------------------------- |
| `--background`             | `grey-1100` `#161616` | the recessed shell: page, top bar, tab strip   |
| `--card`                   | `grey-1000` `#242424` | the content surface: cards, panels, tray items |
| `--muted`                  | `grey-900` `#2e2e2e`  | recessed wells _inside_ a card                 |
| `--secondary` / `--accent` | `grey-800` `#3a3a3a`  | raised and interactive fills                   |
| `--popover`                | `grey-1000`           | raised by elevation, not by a lighter fill     |

In dark, surfaces get **lighter** as they come forward. A recessed well inside a card
is therefore lighter than the card — deliberate, and the reverse of the light-mode
intuition.

### State colours

`--destructive`, `--success`, `--warning`, `--info` are **readable-on-dark text and
line colours** (the ramp's `-500` step), matching OC-2's `state-fg-*`. The
background and border steps of that triad are reached with alpha modifiers, which is
what the component layer already does:

```
text-destructive  border-destructive/30  bg-destructive/8
```

Do not add `--state-bg-*` / `--state-border-*` tokens: they would have no consumer.

## 2. Depth

Depth is hairlines, never blur.

| Token                  | Composition                           | Use                                                     |
| ---------------------- | ------------------------------------- | ------------------------------------------------------- |
| `--elevation-ring`     | `0 0 0 .5px rgba(255,255,255,.16)`    | the hairline, as a shadow                               |
| `--elevation-top`      | `0 -.5px 0 rgba(255,255,255,.06)`     | the top-edge catchlight                                 |
| `--elevation-elements` | `0 .5px .5px 0 rgba(0,0,0,.40)`       | a small element's bottom edge (cards, inputs, switches) |
| `--elevation-raised`   | ring + catchlight + `2px/4px` ambient | panels                                                  |
| `--elevation-floating` | same pieces, `8px/16px` ambient       | popovers, menus, selects, toasts                        |
| `--elevation-overlay`  | same pieces, `16px/32px` ambient      | dialogs, sheets, drawers                                |

Exposed to Tailwind as `shadow-ring`, `shadow-top`, `shadow-elements`,
`shadow-raised`, `shadow-floating`, `shadow-overlay`. `shadow-ring` and `shadow-top`
are split out because the component layer draws hairlines on pseudo-elements with
`bg-clip-padding`, which needs the pieces rather than a composed shadow.

`--shadow-xs … --shadow-2xl` are **deprecated aliases** kept so existing call sites
keep rendering while they migrate onto the named levels. Prefer the named levels in
new code.

**A surface gets a border or a ring, not both.** Floating surfaces use the ring
alone — a real 1px border plus a 0.5px ring reads as a doubled hairline. Raised
surfaces (`Card`, `FramePanel`) use a translucent border plus `shadow-elements`.

**Hover and press are overlays**, not mixed colours: `bg-overlay-hover` (6% white),
`bg-overlay-pressed` (10% white), `bg-overlay-scrim` (60% black). One token, correct
on every surface. Never reintroduce `color-mix(in_srgb, var(--card), white 2%)`.

## 3. Shell and navigation

```
┌ top bar        h-12   logo · workspace switcher · … · search · account ┐
├ tab strip      h-10 + 1px rule, underline indicator on the active tab   ┤
│ content        scrolls; routes own their padding                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- **There is no sidebar.** `packages/ui` does not ship one. Destinations live in the
  tab strip; a destination that gains children (Settings) gets a bordered sub-nav
  tray with the current item filled (`settings-nav.tsx`). Settings is the model for
  any future second level.
- The tab strip is `Link` + `activeProps`, not base-ui `Tabs` — it changes routes,
  not local panels. The underline is a pseudo-element switched on by `activeProps`.
- Tablet and below use `MobileLayout` (header + bottom nav). Desktop is the only
  place the tab strip has to fit.
- `--app-chrome` (`5.5625rem`) is the height of everything above the scroll
  container, set on `DesktopLayout`. Routes that size a full-height list against the
  viewport subtract it (`h-[calc(100vh-var(--app-chrome)-Npx)]`). Change the chrome
  and that variable is the one place to change.
- Layout is chosen in `responsive-layout.tsx`; routes never branch on viewport.
  `useLayoutMode()` is for components that must adapt within a route.

## 4. Anti-patterns

Reject in review:

- A hex colour, or a Tailwind palette class, outside `packages/themes` and
  `helpers/colors.ts`.
- A new shadow that is not one of the named elevation levels.
- `bg-card` on a bar to make it look raised — use the border and hairlines instead.
- Colour-mixed hover states, or a real border under a surface that already carries
  an elevation ring.
- A `dark:` variant on something that is not already `dark:`-conditional. The app is
  dark; a new `dark:` pair implies a light mode that does not exist.
- Tokens with no consumer. A vocabulary earns its place by being used.

## 5. Known compromises

- **`stone`** has no warm grey in OC-2. It reads as the deep end of `yellow` — a
  khaki or sand, distinctly different from both `orange` and the vivid `yellow`
  chip. Revisit only with a data migration on `PG_ENUM_COLOR`.
- **`teal`** reads as OC-2's `cyan`.
- **`Recurring bills`** is labelled **"Bills"** in the tab strip — eight tabs plus
  the logo and account have to fit one row.
- **`--radius`** is `0.625rem`, a carry-over: OC-2 defines no radius scale. The
  console's radii look larger; changing it is a global decision, not a tweak.
