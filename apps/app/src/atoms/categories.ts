import { observable } from "@legendapp/state";

export const selectedCategory$ = observable<{ id: string | null; name: string | null }>({
	id: null,
	name: null,
});

export const categoryTypeFilter$ = observable<"expense" | "income">("expense");
