# StyleX Advanced

Reach for these only when the task needs them. All values stay static-first: literals, vars/consts, or arrow-function dynamics.

## Keyframes

```tsx
const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const styles = stylex.create({
  animated: { animationName: fadeIn, animationDuration: "0.3s", animationTimingFunction: "ease-out" },
});
```

## View transitions

`stylex.viewTransitionClass({ group, imagePair, old, new })` customizes the View Transition API; pass to React's `unstable_ViewTransition`. Combine with `stylex.keyframes()` for enter/exit motion.

## Anchor positioning

`stylex.positionTry({ positionAnchor: "--anchor", top, left, width, height })` defines fallback position; attach via `positionTryFallbacks`.

## Relational selectors

Style by ancestor/descendant/sibling state with `stylex.when.ancestor/descendant/anySibling/siblingBefore/siblingAfter()` as computed condition keys. Mark the observed element with `stylex.defaultMarker()` (or `stylex.defineMarker()` for custom markers):

```tsx
const styles = stylex.create({
  card: { transform: { default: "translateX(0)", [stylex.when.ancestor(":hover")]: "translateX(10px)" } },
});
<div {...stylex.props(stylex.defaultMarker())}>
  <div {...stylex.props(styles.card)}>…</div>
</div>
```

## Fallbacks

`stylex.firstThatWorks("sticky", "-webkit-sticky", "fixed")` emits progressive-enhancement fallbacks for one property.

## Advanced types

```tsx
import type { StyleXStyles, StyleXStylesWithout, VarGroup } from "@stylexjs/stylex";

type Props = {
  style?: StyleXStyles; // any styles
  layout?: StyleXStylesWithout<{ margin: unknown; padding: unknown; width: unknown; height: unknown }>;
  theme?: VarGroup<typeof colors>; // a createTheme() result for a var group
};
```

Prefer `StyleXStyles` / `StyleXStylesWithout` over legacy `StaticStyles` types.
