import { atom } from "jotai";

import type { CategorySchema } from "@/lib/schema";

export const selectedCategoryAtom = atom<{ id: string | null; name: string | null }>({
	id: null,
	name: null,
});

export const expenseCategoryFilterAtom = atom<CategorySchema["id"][]>([]);
