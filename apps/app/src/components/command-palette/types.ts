import type { ColorSchema } from "@hoalu/common/schema";

export interface ExpenseSearchResult {
	id: string;
	public_id: string;
	title: string;
	description: string | null;
	amount: number;
	currency: string;
	date: string;
	categoryName: string | undefined;
	categoryColor: ColorSchema | undefined;
	/** uFuzzy highlight ranges for the title: [start0, end0, start1, end1, ...] */
	titleRanges: number[] | null;
	/** uFuzzy highlight ranges for the description: [start0, end0, start1, end1, ...] */
	descriptionRanges: number[] | null;
}

export interface ActionItem {
	id: string;
	label: string;
	meta?: React.ReactNode;
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

export interface UpcomingBillItem {
	recurringBillId: string;
	date: string;
	title: string;
	amount: number;
	currency: string;
	walletName: string;
	categoryName: string | null;
	categoryColor: ColorSchema | null;
}

export type AutocompleteUpcomingBillItem = {
	id: string;
	title: string;
};

export type AutocompleteItem =
	| AutocompleteExpenseItem
	| AutocompleteActionItem
	| AutocompleteUpcomingBillItem;

export type VirtualizedItem =
	| { type: "header"; label: string; itemIndex?: never }
	| { type: "expense"; data: ExpenseSearchResult; itemIndex: number }
	| { type: "action"; data: ActionItem; itemIndex: number }
	| { type: "upcoming-bill"; data: UpcomingBillItem; itemIndex: number };
