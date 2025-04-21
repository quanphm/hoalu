import type { RepeatSchema, WalletTypeSchema } from "@/lib/schema";
import { getCurrencyList } from "@hoalu/countries";

export const THEMES = ["light", "dark"];

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
	.filter((c) => c.value === "USD" || c.value === "VND" || c.value === "SGD" || c.value === "EUR");

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
		label: "⇧ E",
		hotkey: "shift+e",
		enabled: true,
	},
	create_wallet: {
		label: "⇧ W",
		hotkey: "shift+w",
		enabled: true,
	},
	create_category: {
		label: "⇧ C",
		hotkey: "shift+c",
		enabled: true,
	},
	goto_home: {
		label: "⇧ H",
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
		enabled: false,
	},
	goto_library: {
		label: "L",
		hotkey: "l",
		enabled: true,
	},
	goto_preferences: {
		label: "⇧ ⌘ P",
		hotkey: "shift+meta+p",
		enabled: false,
	},
	goto_tokens: {
		label: "⇧ ⌘ A",
		hotkey: "shift+meta+a",
		enabled: false,
	},
	toggle_theme: {
		label: "⇧ D",
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
