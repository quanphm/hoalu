import type { ReactNode } from "react";

export interface ExpenseSearchResult {
	id: string;
	title: string;
	description: string | null;
	amount: number;
	currency: string;
	date: string;
	categoryName: string | undefined;
	/** uFuzzy highlight ranges for the title: [start0, end0, start1, end1, ...] */
	titleRanges: number[] | null;
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
