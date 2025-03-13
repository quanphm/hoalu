import { getCurrencyList } from "@hoalu/countries";

export const TIME_IN_MILLISECONDS = {
	DEFAULT: 1,
	SECOND: 1000,
	MINUTE: 60_000,
	HOUR: 3_600_000,
	DAY: 86_400_000,
	WEEK: 604_800_000,
	YEAR: 31_536_000_000,
} as const;

export const TIME_IN_SECONDS = {
	DEFAULT: 1,
	SECOND: 1,
	MINUTE: 60,
	HOUR: 3_600,
	DAY: 86_400,
	WEEK: 604_800,
	YEAR: 31_536_000,
} as const;

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
	value: string;
}[] = [
	{ label: "Cash", value: "cash" },
	{ label: "Bank account", value: "bank-account" },
	{ label: "Credit card", value: "credit-card" },
	{ label: "Debit card", value: "debit-card" },
];

export const KEYBOARD_SHORTCUTS = {
	create_expense: {
		label: "Shift E",
		hotkey: "shift+e",
	},
	create_wallet: {
		label: "Shift W",
		hotkey: "shift+w",
	},
	goto_home: {
		label: "H",
		hotkey: "h",
	},
	goto_dashboard: {
		label: "D",
		hotkey: "d",
	},
	goto_expenses: {
		label: "E",
		hotkey: "e",
	},
	goto_tasks: {
		label: "T",
		hotkey: "t",
	},
	goto_workspace: {
		label: "S",
		hotkey: "s",
	},
	goto_members: {
		label: "M",
		hotkey: "m",
	},
	goto_library: {
		label: "L",
		hotkey: "l",
	},
	goto_preferences: {
		label: "P",
		hotkey: "p",
	},
	goto_tokens: {
		label: "A",
		hotkey: "a",
	},
	toggle_theme: {
		label: "Shift D",
		hotkey: "shift+d",
	},
	search: {
		label: "/",
		hotkey: "/",
	},
} as const;
