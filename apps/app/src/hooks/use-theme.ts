import { THEMES } from "#app/helpers/constants.ts";
import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemeMode = (typeof THEMES)[number];
export type ResolvedTheme = Exclude<ThemeMode, "system">;

const STORAGE_KEY = "theme";
const DEFAULT_MODE: ThemeMode = "system";

const THEME_COLORS: Record<ResolvedTheme, string> = {
	light: "#f9f7f3",
	dark: "#242a3a",
	creamy: "#f8f4eb",
	deluge: "#1a1f3a",
};

const ALL_THEME_CLASSES: ResolvedTheme[] = ["light", "dark", "creamy", "deluge"];

let currentMode: ThemeMode = DEFAULT_MODE;
let currentResolved: ResolvedTheme = "light";
const listeners = new Set<() => void>();

function notify() {
	for (const listener of listeners) {
		listener();
	}
}

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(mode: ThemeMode): ResolvedTheme {
	return mode === "system" ? getSystemTheme() : mode;
}

function applyTheme(resolved: ResolvedTheme) {
	const root = document.documentElement;

	for (const cls of ALL_THEME_CLASSES) {
		root.classList.remove(cls);
	}
	root.classList.add(resolved);
	root.style.colorScheme = resolved === "dark" || resolved === "deluge" ? "dark" : "light";

	// Update <meta name="theme-color">
	const hex = THEME_COLORS[resolved];
	let meta = document.querySelector(
		'meta[name="theme-color"]:not([media])',
	) as HTMLMetaElement | null;
	if (!meta) {
		meta = document.createElement("meta");
		meta.name = "theme-color";
		document.head.appendChild(meta);
	}
	meta.content = hex;

	// Also update media-specific meta tags if present (for PWA manifest consistency)
	for (const el of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][media]')) {
		el.content = hex;
	}
}

// ── Initialization (runs once at module load in the browser) ───────────────

function init() {
	if (typeof window === "undefined") return;

	const stored = localStorage.getItem(STORAGE_KEY);
	const validModes: readonly string[] = THEMES;
	currentMode = stored && validModes.includes(stored) ? (stored as ThemeMode) : DEFAULT_MODE;
	currentResolved = resolve(currentMode);
	applyTheme(currentResolved);

	// Listen for OS color scheme changes
	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	mq.addEventListener("change", () => {
		if (currentMode !== "system") return;
		currentResolved = getSystemTheme();
		applyTheme(currentResolved);
		notify();
	});
}

init();

function subscribe(onStoreChange: () => void) {
	listeners.add(onStoreChange);
	return () => {
		listeners.delete(onStoreChange);
	};
}

function getMode() {
	return currentMode;
}

function getTheme() {
	return currentResolved;
}

export function useTheme() {
	const mode = useSyncExternalStore(subscribe, getMode, () => DEFAULT_MODE);
	const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as ResolvedTheme);

	const setTheme = useCallback((m: ThemeMode) => {
		currentMode = m;
		if (m === "system") {
			localStorage.removeItem(STORAGE_KEY);
		} else {
			localStorage.setItem(STORAGE_KEY, m);
		}
		currentResolved = resolve(m);
		applyTheme(currentResolved);
		notify();
	}, []);

	// Ensure theme is applied on mount (handles SSR hydration edge case)
	useEffect(() => {
		applyTheme(currentResolved);
	}, []);

	return { mode, theme, setTheme };
}
