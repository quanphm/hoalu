import type { IncomeFormSchema } from "#app/lib/schema.ts";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

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
