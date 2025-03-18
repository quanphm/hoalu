import type { WalletType } from "@/lib/schema";
import { getCurrencyList } from "@hoalu/countries";

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
	value: WalletType;
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
	create_category: {
		label: "Shift C",
		hotkey: "shift+c",
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

export const AVAILABLE_WORKSPACE_SHORTCUT = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
