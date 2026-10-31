---
name: stylex
description: StyleX styling with @stylexjs/stylex. Use when the user wants to install or configure the StyleX compiler, author styles with stylex.create and stylex.props, define tokens or themes, or migrate existing CSS to StyleX.
---

# StyleX

**Static-first**: the StyleX compiler must see literal values at build time. Anything it can't statically analyze — an imported plain constant, a runtime-built object — silently breaks or fails the build. Every rule below serves static-first.

## Author styles

Styles live in `stylex.create()` namespaces; they reach the DOM only through `stylex.props()` spread. Never put `style` or `className` on an element with a `stylex.props()` spread.

```tsx
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  card: { display: "flex", padding: 16 }, // lengths default to px
  highlighted: { backgroundColor: "yellow" },
});

function Card({ style, children }: { style?: StyleXStyles; children: React.ReactNode }) {
  return <div {...stylex.props(styles.card, style)}>{children}</div>; // local first, prop overrides
}
```

Merge with multiple args or arrays — last wins. Conditionals are plain JS (`cond && styles.x`, ternaries). Unset with `null`.

## Conditions nest inside properties

Pseudo-classes, pseudo-elements (as namespace keys), and `@media`/`@supports`/`@container` nest **inside property values**, never at the top level. Every condition object needs a `default` key (`null` = no style by default).

```tsx
const styles = stylex.create({
  button: {
    backgroundColor: { default: "lightblue", ":hover": "blue" },
    padding: { default: 8, "@media (min-width: 768px)": 16 },
  },
  input: { "::placeholder": { color: "gray" } },
});
```

Prefer real elements over `::before`/`::after`, and JS-driven state over `:first-child`/`:nth-child` — smaller bundles, better accessibility. Share app-wide queries via `stylex.defineConsts()` (see below).

## Tokens, constants, themes

- `stylex.defineVars()` — values that get themed or overridden at runtime (colors, spacing). Must live in `.stylex.ts` files, named exports only, nothing else in the file.
- `stylex.defineConsts()` — static shared values (breakpoints, z-indices). Same file rules. Prefer consts when no theming is needed.
- `stylex.createTheme(vars, overrides)` — theme a DOM sub-tree; can live anywhere and is applied via `stylex.props(isDark && darkTheme)`.

```tsx
// tokens.stylex.ts
import * as stylex from "@stylexjs/stylex";
export const colors = stylex.defineVars({ primary: "blue", text: "black" });
export const breakpoints = stylex.defineConsts({ wide: "@media (min-width: 1024px)" });
```

Dynamic runtime values use arrow-function styles: `bar: (width: number) => ({ width })`, called as `styles.bar(100)`.

## Never do

- Import a non-StyleX value into `stylex.create()` (use vars/consts from `.stylex.ts`).
- Mix `style`/`className` with a `stylex.props()` spread.
- Hoist conditions to the top level of a namespace.
- Default-export from `.stylex.ts` files.

## Verify (every change)

- [ ] Every `stylex.create` value is a literal, a StyleX var/const, or an arrow-function dynamic style — no imported plain values.
- [ ] No element mixes a `stylex.props()` spread with `style` or `className`.
- [ ] Every nested condition object has a `default` key.
- [ ] `.stylex.ts` files hold only named `defineVars`/`defineConsts` exports.
- [ ] Compiler plugin configured and the `@stylex` entry CSS imported (see [installation.md](installation.md)).
- [ ] Typecheck and lint pass (`@stylexjs/valid-styles`, `@stylexjs/no-unused`).

## Further reading

- [installation.md](installation.md) — compiler setup per build tool, entry CSS, options, ESLint, CLI, troubleshooting. Reach when styles don't appear or the build isn't wired.
- [advanced.md](advanced.md) — keyframes, view transitions, anchor positioning, relational (`stylex.when.*`) selectors, `firstThatWorks` fallbacks, advanced `StyleXStyles` types. Reach only when the task needs one of these.
- Design-system bridge: tokens live in `*.stylex.ts`, themes via `createTheme`. Later design-system work consumes these files directly — keep token names semantic (`colors.text`, not `colors.gray900`) so themes stay meaningful.
