import { observable } from "@legendapp/state";

export type CategoryTypeFilter = "all" | "expense" | "income";

export const categoryTypeFilter$ = observable<CategoryTypeFilter>("all");

export const categorySearchKeywords$ = observable<string>("");
