import type { RepeatSchema, WalletTypeSchema } from "@hoalu/common/schema";
import { getCurrencyList } from "@hoalu/countries";

export const SYSTEM_THEMES = ["system", "light", "dark"] as const;
export const CUSTOM_THEMES = ["creamy"] as const;
export const THEMES = [...SYSTEM_THEMES, ...CUSTOM_THEMES] as const;
export const THEME_LABELS: Record<(typeof THEMES)[number], string> = {
	system: "System",
	light: "Light",
	dark: "Dark",
	creamy: "Creamy",
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
	create_recurring_bill: {
		label: `${kbdSymbols.SHIFT} B`,
		hotkey: "shift+b",
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
	create_income: {
		label: `${kbdSymbols.SHIFT} I`,
		hotkey: "shift+i",
		enabled: true,
	},
	goto_home: {
		label: "GH",
		hotkey: "g>h",
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
	goto_incomes: {
		label: "GI",
		hotkey: "g>i",
		enabled: true,
	},
	goto_tasks: {
		label: "GT",
		hotkey: "g>t",
		enabled: false,
	},
	goto_recurring_bills: {
		label: "GR",
		hotkey: "g>r",
		enabled: true,
	},
	goto_categories: {
		label: "GC",
		hotkey: "g>c",
		enabled: true,
	},
	goto_wallets: {
		label: "GW",
		hotkey: "g>w",
		enabled: true,
	},
	goto_files: {
		label: "GF",
		hotkey: "g>f",
		enabled: true,
	},
	goto_workspace: {
		label: "GS",
		hotkey: "g>s",
		enabled: true,
	},
	goto_members: {
		label: "GM",
		hotkey: "g>m",
		enabled: true,
	},
	goto_preferences: {
		label: `GP`,
		hotkey: "g>p",
		enabled: false,
	},
	goto_tokens: {
		label: `GA`,
		hotkey: "g>a",
		enabled: false,
	},
	toggle_theme: {
		label: `${kbdSymbols.SHIFT} D`,
		hotkey: "shift+d",
		enabled: true,
	},
	command_palette: {
		label: `${kbdSymbols.META} K`,
		hotkey: "meta+k",
		enabled: true,
	},
} as const;

export const AVAILABLE_WORKSPACE_SHORTCUT = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"0",
] as const;

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

export const AVAILABLE_TO_DATE_RANGE_OPTIONS = [
	{ value: "wtd", label: "Week to date" },
	{ value: "mtd", label: "Month to date" },
	{ value: "ytd", label: "Year to date" },
	{ value: "all", label: "All time" },
] as const;

export const DEFAULT_DATE_RANGE = "mtd";

export const MAX_QUEUE_SIZE = 4;
