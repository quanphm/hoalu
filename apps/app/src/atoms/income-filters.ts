import { atom } from "jotai";

export const selectedIncomeAtom = atom<{ id: string | null }>({ id: null });
export const incomeCategoryFilterAtom = atom<string[]>([]);
export const incomeWalletFilterAtom = atom<string[]>([]);
export const incomeAmountFilterAtom = atom<{ min: number | null; max: number | null }>({
	min: null,
	max: null,
});
export const incomeSearchKeywordsAtom = atom<string>("");
