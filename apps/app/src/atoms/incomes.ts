import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { IncomeFormSchema } from "#app/lib/schema.ts";

type IncomeAtomSchema = IncomeFormSchema;
const basedIncome: IncomeAtomSchema = {
	title: "",
	description: "",
	date: new Date().toISOString(),
	transaction: {
		value: 0,
		currency: "",
	},
	walletId: "",
	categoryId: "",
};

export const draftIncomeAtom = atomWithStorage("draft_income", basedIncome);

export const selectedIncomeAtom = atom<{
	id: string | null;
}>({
	id: null,
});

export const incomeCategoryFilterAtom = atom<string[]>([]);
export const incomeWalletFilterAtom = atom<string[]>([]);
export const incomeAmountFilterAtom = atom<{ min: number | null; max: number | null }>({
	min: null,
	max: null,
});
export const incomeSearchKeywordsAtom = atom<string>("");
