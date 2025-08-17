import { atom } from "jotai";

export const selectedCategoryAtom = atom<{ id: string | null; name: string | null }>({
	id: null,
	name: null,
});
