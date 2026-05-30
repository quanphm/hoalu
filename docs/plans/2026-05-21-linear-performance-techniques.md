# Apply Linear Performance Techniques to HoaLu

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make HoaLu feel as fast as Linear — instant mutations, near-instant first load, and buttery-smooth interactions.

**Architecture:** HoaLu already has the hardest piece (Electric SQL local-first sync + IndexedDB-backed PGlite). The gaps are in build configuration, first-load strategy, auth flow, mutation optimism, animation discipline, and granular rendering.

**Tech Stack:** Bun 1.3.9, React 19, Hono, Electric SQL (PGlite), TanStack (Router/Query/DB/Virtual), Vite 8, Tailwind 4, motion

---

## Current State vs Linear (Gap Analysis)

| Technique                | Linear                        | HoaLu                                             | Gap           |
| ------------------------ | ----------------------------- | ------------------------------------------------- | ------------- |
| Database in browser      | IndexedDB + MobX              | PGlite + IndexedDB                                | Already there |
| Optimistic mutations     | Mutate local first, sync bg   | Mutations wait for API response                   | MAJOR         |
| First-load blocking auth | Render first, auth second     | `ensureQueryData(sessionOptions())` blocks render | MAJOR         |
| Code splitting           | Hundreds of route chunks      | `autoCodeSplitting: false`                        | MAJOR         |
| Module preloading        | `modulepreload` in `<head>`   | None                                              | MAJOR         |
| Inlined app shell        | Critical CSS + JS in `<head>` | Blank page until JS loads                         | MAJOR         |
| Font loading             | `crossorigin` preload         | `font-display: swap` only                         | MEDIUM        |
| ESNext target            | `target: "esnext"`            | Default (likely includes polyfills)               | MEDIUM        |
| Vendor chunking          | Per-package chunks            | Single vendor bundle                              | MEDIUM        |
| Animation discipline     | GPU-only, sub-100ms           | Needs audit                                       | MEDIUM        |
| Keyboard-first           | Shortcuts visible in UI       | Has hotkeys, not surfaced                         | LOW           |
| Granular re-renders      | MobX per-property observables | Jotai atoms (decent)                              | LOW           |
| CSS minification         | lightningcss                  | Default                                           | LOW           |

---

## Task 1: Enable Aggressive Code Splitting + ESNext Target

**Objective:** Ship less code, split into route-level chunks, and target modern browsers only.

**Files:**

- Modify: `apps/app/vite.config.ts`

**Step 1: Update vite.config.ts**

```typescript
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	envPrefix: "PUBLIC_",
	plugins: [
		devtools({
			consolePiping: { enabled: false },
			enhancedLogs: { enabled: false },
		}),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		viteReact(),
		VitePWA({
			strategies: "generateSW",
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico"],
			manifest: {
				name: "Hoalu",
				short_name: "Hoalu",
				icons: [
					{
						src: "/images/web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/images/web-app-manifest-144x144.png",
						sizes: "144x144",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/images/web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				cleanupOutdatedCaches: true,
				maximumFileSizeToCacheInBytes: 10_000_000,
				globPatterns: ["**/*.{js,css,html,svg,data,wasm,woff2}"],
			},
			devOptions: {
				enabled: process.env.SW_DEV === "true",
				type: "module",
				navigateFallback: "index.html",
			},
		}),
	],
	define: {
		"import.meta.env.PUBLIC_APP_VERSION": JSON.stringify(process.env.npm_package_version),
	},
	build: {
		target: "esnext",
		cssMinify: "lightningcss",
		modulePreload: { polyfill: false },
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						const pkg = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1];
						if (pkg) return `vendor-${pkg.replace("@", "").replace("/", "-")}`;
					}
				},
			},
		},
	},
	optimizeDeps: {
		exclude: ["@electric-sql/pglite"],
	},
});
```

**Step 2: Verify build**

```bash
cd ~/Development/hoalu/apps/app && bun run build
```

Expected: Build succeeds. Check `dist/assets/` for route-level chunks (`_dashboard-$slug...js`) and per-package vendor chunks (`vendor-react...js`).

**Step 3: Commit**

```bash
git add apps/app/vite.config.ts
git commit -m "perf: enable code splitting, esnext target, lightningcss, per-package vendor chunks"
```

---

## Task 2: Add Module Preloading to index.html

**Objective:** Eliminate the serial import waterfall by telling the browser about all critical chunks before JS executes.

**Files:**

- Modify: `apps/app/index.html`

**Note:** Vite auto-generates `<link rel="modulepreload">` tags in the built HTML. This task is about verifying they appear and ensuring the PWA service worker doesn't interfere with precaching.

**Step 1: Build and inspect**

```bash
cd ~/Development/hoalu/apps/app && bun run build
cat dist/index.html | grep modulepreload | head -20
```

Expected: Should see multiple `<link rel="modulepreload" ...>` tags in the built HTML.

**Step 2: Verify cross-origin matching**

Check that `crossorigin` attribute on modulepreload links matches the entry script's `crossorigin` attribute.

If the entry script has no `crossorigin`, ensure modulepreload links also have none (Vite default).

**Step 3: Commit**

```bash
git add apps/app/index.html
git commit -m "perf: verify modulepreload generation in build output"
```

---

## Task 3: Inline App Shell (Critical CSS + Boot JS)

**Objective:** Show a themed loading shell immediately (before any JS bundle loads) so the user sees something, not a white screen.

**Files:**

- Modify: `apps/app/index.html`
- Create: `apps/app/src/styles/shell.css` (optional, if inlining gets too large)

**Step 1: Add inlined critical CSS and boot JS**

Replace the current `<head>` content in `index.html` with an inlined app shell. This should:

1. Set CSS variables for theme colors from localStorage (or fallback defaults)
2. Paint the app borders/layout skeleton
3. Show a centered loading indicator
4. Read splashScreenConfig from localStorage to restore sidebar width, dark mode, etc.
5. Add `logged-out` class if no ApplicationStore in localStorage

Here's the new `index.html`:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
		/>
		<meta name="theme-color" content="#f9f7f3" media="(prefers-color-scheme: light)" />
		<meta name="theme-color" content="#242a3a" media="(prefers-color-scheme: dark)" />
		<meta name="mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-title" content="Hoalu" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
		<link rel="icon" type="image/png" href="/images/favicon-96x96.png" sizes="96x96" />
		<link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
		<link rel="shortcut icon" href="/images/favicon.ico" />
		<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />

		<!-- Font preloads -->
		<link
			rel="preload"
			href="/fonts/geist-sans/Geist[wght].woff2"
			as="font"
			type="font/woff2"
			crossorigin
		/>
		<link
			rel="preload"
			href="/fonts/geist-mono/GeistMono[wght].woff2"
			as="font"
			type="font/woff2"
			crossorigin
		/>

		<link href="/src/styles/global.css" rel="stylesheet" />

		<!-- Inlined app shell: renders BEFORE any JS bundle loads -->
		<style>
			:root {
				--bg-color: #f9f7f3;
				--bg-base-color: #ffffff;
				--bg-border-color: #e5e0d5;
				--text-muted: #8b8680;
			}
			.dark {
				--bg-color: #1a1d2e;
				--bg-base-color: #242a3a;
				--bg-border-color: #2e3448;
				--text-muted: #6b7280;
			}
			html {
				background: var(--bg-color);
				height: 100%;
			}
			body {
				margin: 0;
				font-family: "Geist", system-ui, sans-serif;
			}

			#app-shell {
				display: flex;
				height: 100vh;
				width: 100vw;
				align-items: center;
				justify-content: center;
				background: var(--bg-color);
			}

			#app-shell-inner {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 12px;
				color: var(--text-muted);
			}

			#app-shell-logo {
				width: 40px;
				height: 40px;
				border-radius: 10px;
				background: linear-gradient(135deg, #6366f1, #8b5cf6);
				animation: shell-pulse 1.2s ease-in-out infinite;
			}

			@keyframes shell-pulse {
				0%,
				100% {
					opacity: 0.6;
					transform: scale(0.95);
				}
				50% {
					opacity: 1;
					transform: scale(1.05);
				}
			}
		</style>

		<script>
			performance.mark("appStart");
			// Restore dark mode before paint
			try {
				const c = JSON.parse(localStorage.getItem("splashScreenConfig") || "{}");
				if (c.darkMode) document.documentElement.classList.add("dark");
				if (c.bgSidebarColor)
					document.documentElement.style.setProperty("--bg-sidebar-color", c.bgSidebarColor);
				if (c.sidebarWidth)
					document.documentElement.style.setProperty("--sidebar-width", c.sidebarWidth + "px");
			} catch (_) {}
			// Detect logged-out state
			if (localStorage.getItem("ApplicationStore") === null) {
				document.documentElement.classList.add("logged-out");
			}
		</script>

		<title>Hoalu</title>
	</head>
	<body>
		<div id="root">
			<!-- App shell: shown until React mounts -->
			<div id="app-shell">
				<div id="app-shell-inner">
					<div id="app-shell-logo"></div>
					<span>Hoalu</span>
				</div>
			</div>
		</div>
		<script type="module" src="/src/main.tsx"></script>
	</body>
</html>
```

**Step 2: Mount React into #root, replacing the shell**

The existing `main.tsx` already does `createRoot(rootElement)` which replaces the shell HTML with React. No changes needed there — React's `root.render()` replaces `#root`'s inner content.

**Step 3: Verify**

```bash
cd ~/Development/hoalu/apps/app && bun run build && bun run preview
```

Open the preview. On a slow connection (throttled in DevTools), you should see the app shell (pulsing logo + "Hoalu" text) immediately, before the JS bundle finishes loading.

**Step 4: Commit**

```bash
git add apps/app/index.html
git commit -m "perf: add inlined app shell with critical CSS and boot JS"
```

---

## Task 4: Render-First, Auth-Second — Don't Block on Session Validation

**Objective:** Remove the blocking `ensureQueryData(sessionOptions())` call so the dashboard renders immediately from local IndexedDB data, and auth errors redirect asynchronously.

**Files:**

- Modify: `apps/app/src/routes/_dashboard/route.tsx`

**Current code (problematic):**

```typescript
beforeLoad: async ({ context: { queryClient } }) => {
  const auth = await queryClient.ensureQueryData(sessionOptions());
  if (!auth?.user) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
},
```

**Step 1: Rewrite the route**

```typescript
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ResponsiveLayout } from "#app/components/layouts/responsive-layout.tsx";
import { DashboardActionProvider } from "#app/components/providers/dashboard-action-provider.tsx";
import { DialogProvider } from "#app/components/providers/dialog-provider.tsx";
import { listWorkspacesOptions, sessionOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard")({
  // Start session fetch in background — don't block render
  beforeLoad: ({ context: { queryClient } }) => {
    // Fire-and-forget: prefetch session in background
    // If it fails with 401, the API client interceptor handles redirect
    queryClient.prefetchQuery(sessionOptions()).catch((err) => {
      if (err?.status === 401) {
        // Session expired — redirect to login
        throw redirect({
          to: "/login",
          search: { redirect: window.location.href },
        });
      }
    });
    // Also prefetch workspaces
    queryClient.prefetchQuery(listWorkspacesOptions());
  },
  loader: ({ context: { queryClient } }) => {
    // Prefetch workspaces for faster navigation
    queryClient.prefetchQuery(listWorkspacesOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DialogProvider>
      <ResponsiveLayout>
        <DashboardActionProvider>
          <Outlet />
        </DashboardActionProvider>
      </ResponsiveLayout>
    </DialogProvider>
  );
}
```

**Step 2: Add auth-error interceptor to the API client**

The app needs a global interceptor that catches 401 responses and redirects to `/login`. Check if `api-client.ts` already has this. If not, add it to the existing `apps/app/src/lib/api-client.ts` or the query client.

**Step 3: Verify behavior**

1. Log in normally — dashboard should render immediately from cached data
2. Clear session cookie, refresh — should briefly show cached data, then redirect to login when API call fails
3. Fresh browser, no localStorage — should redirect to login

**Step 4: Commit**

```bash
git add apps/app/src/routes/_dashboard/route.tsx
git commit -m "perf: render-first auth-second — don't block on session validation"
```

---

## Task 5: Add Optimistic Updates to Key Mutations

**Objective:** Mutations (create expense, update expense, delete, etc.) should update the UI immediately without waiting for the server. Server response reconciles in the background.

**Files:**

- Modify: `apps/app/src/services/mutations.ts`

**Step 1: Identify high-value mutations**

Prioritize these (most frequent user actions):

1. `useCreateExpense` — creating a new expense
2. `useEditExpense` — editing an expense
3. `useDeleteExpense` — deleting an expense
4. `useCreateIncome` — creating income
5. `useEditIncome` — editing income
6. `useDeleteIncome` — deleting income

**Step 2: Add `onMutate` with optimistic cache update**

For `useCreateExpense`, the pattern:

```typescript
export function useCreateExpense() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();

	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: ExpensePostSchema }) => {
			const { data, error } = await apiClient.bff.expenses.$post({
				json: { ...payload, workspaceSlug: slug },
			});
			if (error) throw error;
			return data;
		},
		onMutate: async ({ payload }) => {
			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey: expenseKeys.withSlug(slug) });

			// Snapshot previous value for rollback
			const previousExpenses = queryClient.getQueryData(expenseKeys.withSlug(slug));

			// Optimistically add the new expense
			queryClient.setQueryData(expenseKeys.withSlug(slug), (old: SyncedExpense[] | undefined) => {
				const optimistic = {
					id: `temp-${Date.now()}`,
					...payload,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					workspaceId: slug,
				};
				return old ? [optimistic, ...old] : [optimistic];
			});

			// Return context for onError rollback
			return { previousExpenses };
		},
		onError: (_err, _vars, context) => {
			// Rollback on failure
			if (context?.previousExpenses) {
				queryClient.setQueryData(expenseKeys.withSlug(slug), context.previousExpenses);
			}
			toastManager.add({ title: "Failed to create expense", type: "error" });
		},
		onSettled: () => {
			// Refetch to reconcile with server (replaces optimistic with real data)
			queryClient.invalidateQueries({ queryKey: expenseKeys.withSlug(slug) });
		},
	});
	return mutation;
}
```

**Step 3: Repeat for other mutations**

Apply the same `onMutate` + `onError` rollback pattern to edit and delete mutations.

**Step 4: Remove spinners/loading states from mutation triggers**

Since the UI now updates immediately, remove any loading spinners or disabled states that wait for mutation completion. The mutation should feel instant.

**Step 5: Commit**

```bash
git add apps/app/src/services/mutations.ts
git commit -m "perf: add optimistic updates to expense and income mutations"
```

---

## Task 6: Audit and Fix Animations

**Objective:** Ensure animations only use composited properties (transform, opacity) and durations stay under 150ms. Never animate layout-triggering properties.

**Files:**

- Audit: `apps/app/src/styles/animation.css`
- Audit: `packages/ui/src/components/` (all components using motion or transitions)
- Audit: `apps/app/src/components/` (all components using motion or transitions)

**Step 1: Search for animation problem patterns**

```bash
cd ~/Development/hoalu
# Find layout-triggering property animations
rg -n "transition.*\b(width|height|top|left|margin|padding|border-width)\b" apps/ packages/ --type tsx --type ts --type css

# Find motion.div with layout-triggering animate props
rg -n "animate=\{\{.*\b(width|height|margin|padding)\b" apps/ packages/ --type tsx
```

**Step 2: Fix each violation**

For each match:

**Bad (layout-triggering):**

```tsx
<motion.div animate={{ height: isOpen ? "auto" : 0 }} transition={{ duration: 0.3 }} />
```

**Good (GPU-only):**

```tsx
<motion.div
	animate={{ scaleY: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
	style={{ originY: 0 }}
	transition={{ duration: 0.15 }}
/>
```

**Step 3: Add CSS animation speed variables**

In `animation.css`, add:

```css
:root {
	--speed-highlightFadeIn: 0s;
	--speed-highlightFadeOut: 0.15s;
	--speed-quickTransition: 0.1s;
	--speed-regularTransition: 0.2s;
	--speed-slowTransition: 0.3s;
}
```

Replace hardcoded durations throughout the codebase with these variables.

**Step 4: Verify**

Use Chrome DevTools Performance tab to record interactions and check for:

- No "Long Tasks" during animations
- No layout thrashing during hover/click
- FPS stays at 60 during transitions

**Step 5: Commit**

```bash
git add apps/app/src/styles/animation.css
git commit -m "perf: fix layout-triggering animations, add speed variables"
```

---

## Task 7: Service Worker — Precache the Full App in Background

**Objective:** After first load, precache all route chunks so subsequent navigations skip the network entirely.

**Files:**

- Modify: `apps/app/vite.config.ts` (PWA config)

**Step 1: Update workbox strategy**

```typescript
VitePWA({
  strategies: "generateSW",
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico"],
  manifest: { /* unchanged */ },
  workbox: {
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 10_000_000,
    globPatterns: ["**/*.{js,css,html,svg,png,data,wasm,woff2}"],
    // Precache all chunks on install — subsequent navs skip network
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(js|css|woff2)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-resources",
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
  devOptions: { /* unchanged */ },
}),
```

**Step 2: Verify precaching**

```bash
cd ~/Development/hoalu/apps/app && bun run build
```

Open the built app, open DevTools → Application → Cache Storage. Should see all JS/CSS chunks cached.

Reload the page — check Network tab: JS/CSS should say "(ServiceWorker)" or "(disk cache)".

**Step 3: Commit**

```bash
git add apps/app/vite.config.ts
git commit -m "perf: precache all static resources in service worker"
```

---

## Task 8: Add Performance Instrumentation

**Objective:** Add `performance.mark` and `performance.measure` calls so we can track real-world load times and catch regressions.

**Files:**

- Modify: `apps/app/src/main.tsx`

**Step 1: Add navigation timing marks**

In `main.tsx`, add after React mounts:

```typescript
// After root.render(...)
if (typeof window !== "undefined") {
	performance.mark("appMounted");
	performance.measure("app-boot", "appStart", "appMounted");

	// Report to analytics or console in dev
	if (import.meta.env.DEV) {
		const bootTime = performance.getEntriesByName("app-boot")[0]?.duration;
		console.log(`[perf] App boot: ${bootTime?.toFixed(0)}ms`);
	}
}
```

**Step 2: Add route-level timing**

In the root route, use TanStack Router's `onLoad` to measure route transitions:

```typescript
// In __root.tsx or _dashboard/route.tsx
const router = createRouter({
	// ... existing config
	defaultOnCatch: (error) => {
		performance.mark(`route-error-${Date.now()}`);
	},
});
```

**Step 3: Commit**

```bash
git add apps/app/src/main.tsx
git commit -m "perf: add performance instrumentation for boot and route timing"
```

---

## Execution Order

Tasks are ordered by impact-to-effort ratio:

1. **Task 1** — Code splitting + esnext (build config, no runtime risk)
2. **Task 3** — Inlined app shell (index.html only, huge UX win)
3. **Task 4** — Render-first auth (changes auth flow, test carefully)
4. **Task 2** — Module preloading (verify build output, no code changes)
5. **Task 5** — Optimistic mutations (touches core data flow, test thoroughly)
6. **Task 6** — Animation audit (fix regressions, visual QA)
7. **Task 7** — Service worker precaching (PWA config)
8. **Task 8** — Performance instrumentation (dev tooling)

---

## Verification Checklist

After all tasks, verify:

- [ ] `bun run build` succeeds with no errors
- [ ] `dist/` contains route-level chunks and per-package vendor chunks
- [ ] `dist/index.html` has `modulepreload` links
- [ ] Cold load shows app shell immediately (not white screen)
- [ ] Dashboard renders from cached data before auth validates
- [ ] Expired session shows cached data briefly then redirects to login
- [ ] Creating an expense updates the list instantly (no spinner)
- [ ] Editing/deleting expenses feels instant
- [ ] Hovering over list items doesn't cause layout shift
- [ ] Animations are smooth at 60fps (check DevTools Performance tab)
- [ ] Service worker caches all static assets
- [ ] Second load / subsequent navigations are instant
- [ ] `bun run lint` passes
- [ ] `bun run format:check` passes
