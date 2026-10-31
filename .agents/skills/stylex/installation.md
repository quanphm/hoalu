# StyleX Installation

StyleX needs its build-time compiler; without it no CSS is emitted. Pick one setup below (adapt the package manager to the project), then always do §3.

## 1. Install

```bash
npm install @stylexjs/stylex            # runtime, always
npm install --save-dev @stylexjs/unplugin   # Vite, Rollup, Webpack, esbuild, Rspack
npm install --save-dev @stylexjs/babel-plugin @stylexjs/postcss-plugin  # Next.js only
```

## 2. Configure

**Vite** — StyleX plugin before `@vitejs/plugin-react` (preserves Fast Refresh):

```ts
import stylex from "@stylexjs/unplugin";
export default defineConfig({ plugins: [stylex.vite({ useCSSLayers: true }), react()] });
```

**Next.js** — babel plugin (`dev`, `runtimeInjection: false`, `treeshakeCompensation: true`, path `aliases`) + PostCSS plugin (`include` globs, shared `babelConfig`, `useCSSLayers: true`, plus `autoprefixer`). Full snippets in the [upstream guide](https://raw.githubusercontent.com/facebook/stylex/refs/heads/main/packages/docs/static/llm/stylex-installation.md).

**Webpack / Rspack / esbuild / Rollup** — same one-liner through `@stylexjs/unplugin`:

```js
stylex.webpack({ useCSSLayers: true });  // or .rspack() / .esbuild() / .rollup() / .vite()
```

## 3. CSS entrypoint (all setups)

```css
/* src/index.css */
@stylex;
```

```tsx
import "./index.css"; // from the app entry
```

The plugin aggregates all compiled atomic CSS into this file at build time.

## Options

- Babel plugin: `dev` (readable class names), `runtimeInjection` (keep `false` for prod), `treeshakeCompensation` (keep `true` — stops tree-shaking eating styles), `aliases` (mirror bundler paths), `classNamePrefix` (default `'x'`), `styleResolution`: `'property-specificity'` (default; most specific property wins) vs `'application-order'` (last wins).
- Unplugin/PostCSS: `useCSSLayers` (default `false`; `true` wraps output in `@layer` for cascade control), `include` (default all js/ts), `exclude` (default `node_modules/**`).
- Precedence against existing CSS: `useCSSLayers: false` lets StyleX override legacy styles; otherwise `true`.

## TypeScript

No setup needed. For style-prop typing: `import type { StyleXStyles } from "@stylexjs/stylex"` (optionally constrained: `StyleXStyles<{ color?: string }>`).

## ESLint

```bash
npm install --save-dev @stylexjs/eslint-plugin
```

Rules: `@stylexjs/valid-styles: error`, `@stylexjs/no-unused: error`, `@stylexjs/valid-shorthands: warn`, `@stylexjs/sort-keys: warn`. Theme files additionally gated by `@stylexjs/enforce-extension` (`.stylex.js`).

## CLI (no bundler)

```bash
npm install --save-dev @stylexjs/cli
npx stylex --input ./src --output ./dist
```

## Troubleshooting

- **No styles**: entry CSS with `@stylex` not imported; files outside `include`; StyleX plugin ordered after other transforms.
- **Styles vanish**: set `treeshakeCompensation: true`.
- **Slow builds**: narrow `include`/`exclude`.
