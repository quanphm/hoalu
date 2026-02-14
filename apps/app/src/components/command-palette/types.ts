import type { ReactNode } from "react";

export interface ExpenseSearchResult {
	id: string;
	title: string;
	description: string | null;
	amount: number;
	currency: string;
	date: string;
	categoryName: string | undefined;
}

export interface ActionItem {
	id: string;
	label: string;
	meta?: ReactNode;
	onAction: () => void;
}

export type AutocompleteExpenseItem = {
	id: string;
	title: string;
	amount: number;
};

export type AutocompleteActionItem = {
	id: string;
	label: string;
};

export type AutocompleteItem = AutocompleteExpenseItem | AutocompleteActionItem;

export type VirtualizedItem =
	| { type: "header"; label: string; itemIndex?: never }
	| { type: "expense"; data: ExpenseSearchResult; itemIndex: number }
	| { type: "action"; data: ActionItem; itemIndex: number };
