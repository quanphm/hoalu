import { atom } from "jotai";

export const selectedCategoryAtom = atom<{ id: string | undefined; name: string | undefined }>({
	id: undefined,
	name: undefined,
});
