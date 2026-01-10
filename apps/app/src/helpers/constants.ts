import type { RepeatSchema, WalletTypeSchema } from "@hoalu/common/schema";
import { getCurrencyList } from "@hoalu/countries";

export const THEMES = ["light", "dark", "creamy", "deluge"] as const;
export const THEME_LABELS: Record<(typeof THEMES)[number], string> = {
	light: "Light",
	dark: "Dark",
	creamy: "Creamy",
	deluge: "Deluge",
};

export const kbdSymbols = {
	SHIFT: "⇧",
	META: "⌘",
};

export const AVAILABLE_CURRENCY_OPTIONS: {
	label: string;
	value: string;
}[] = getCurrencyList()
	.map((c) => ({
		label: c,
		value: c,
	}))
	.filter((c) => ["USD", "VND", "SGD", "EUR"].includes(c.value));

export const AVAILABLE_WALLET_TYPE_OPTIONS: {
	label: string;
	value: WalletTypeSchema;
}[] = [
	{ label: "Cash", value: "cash" },
	{ label: "Bank account", value: "bank-account" },
	{ label: "Credit card", value: "credit-card" },
	{ label: "Debit card", value: "debit-card" },
	{ label: "Digital account", value: "digital-account" },
];

export const AVAILABLE_REPEAT_OPTIONS: {
	label: string;
	value: RepeatSchema;
}[] = [
	{ label: "One-time", value: "one-time" },
	{ label: "Everyday", value: "daily" },
	{ label: "Every week", value: "weekly" },
	{ label: "Every month", value: "monthly" },
	{ label: "Annual", value: "yearly" },
];

export const KEYBOARD_SHORTCUTS = {
	create_expense: {
		label: `${kbdSymbols.SHIFT} E`,
		hotkey: "shift+e",
		enabled: true,
	},
	create_wallet: {
		label: `${kbdSymbols.SHIFT} W`,
		hotkey: "shift+w",
		enabled: true,
	},
	create_category: {
		label: `${kbdSymbols.SHIFT} C`,
		hotkey: "shift+c",
		enabled: true,
	},
	goto_home: {
		label: `${kbdSymbols.SHIFT} H`,
		hotkey: "shift+h",
		enabled: true,
	},
	goto_dashboard: {
		label: "D",
		hotkey: "d",
		enabled: true,
	},
	goto_expenses: {
		label: "E",
		hotkey: "e",
		enabled: true,
	},
	goto_tasks: {
		label: "T",
		hotkey: "t",
		enabled: false,
	},
	goto_workspace: {
		label: "S",
		hotkey: "s",
		enabled: true,
	},
	goto_members: {
		label: "M",
		hotkey: "m",
		enabled: true,
	},
	goto_preferences: {
		label: `${kbdSymbols.SHIFT} ⌘ P`,
		hotkey: "shift+meta+p",
		enabled: false,
	},
	goto_tokens: {
		label: `${kbdSymbols.SHIFT} ⌘ A`,
		hotkey: "shift+meta+a",
		enabled: false,
	},
	toggle_theme: {
		label: `${kbdSymbols.SHIFT} D`,
		hotkey: "shift+d",
		enabled: true,
	},
	search: {
		label: "/",
		hotkey: "/",
		enabled: true,
	},
} as const;

export const AVAILABLE_WORKSPACE_SHORTCUT = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export const AVAILABLE_LAST_DAYS_OPTIONS = [
	{ value: "7", label: "Last 7 days" },
	{ value: "30", label: "Last 30 days" },
	{ value: "90", label: "Last 90 days" },
] as const;

export const AVAILABLE_LAST_MONTHS_OPTIONS = [
	{ value: "3m", label: "Last 3 months" },
	{ value: "6m", label: "Last 6 months" },
	{ value: "12m", label: "Last 12 months" },
] as const;

export const AVAILABLE_LAST_RANGE_OPTIONS = [
	...AVAILABLE_LAST_DAYS_OPTIONS,
	...AVAILABLE_LAST_MONTHS_OPTIONS,
] as const;

export const AVAILABLE_TO_DATE_RANGE_OPTIONS = [
	{ value: "wtd", label: "Week to date" },
	{ value: "mtd", label: "Month to date" },
	{ value: "ytd", label: "Year to date" },
	{ value: "all", label: "All time" },
] as const;

export const DEFAULT_DATE_RANGE = "mtd";
