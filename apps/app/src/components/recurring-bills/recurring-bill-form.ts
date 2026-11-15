import * as z from "zod";

import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";

export const BillFormSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	// dueDay stored as string because the pickers emit strings; parsed to number at submit
	dueDay: z.string().optional(),
	// anchorDate: full date, only used when repeat=yearly
	anchorDate: z.string().optional(),
	transaction: z.object({
		value: z.number().min(0),
		currency: z.string().min(1),
	}),
	walletId: z.string().min(1),
	categoryId: z.string().optional(),
	eventId: z.string().optional(),
	repeat: z.string().min(1),
});

export type BillFormSchema = z.infer<typeof BillFormSchema>;

/** A bill recurs, so the entry form's one-time and custom cadences have no place here. */
export const CADENCE_OPTIONS: { label: string; value: string }[] = AVAILABLE_REPEAT_OPTIONS.filter(
	(option) => option.value !== "one-time" && option.value !== "custom",
).map((option) => ({ label: option.label, value: option.value }));

export const DOW_OPTIONS = [
	{ value: "1", label: "Monday" },
	{ value: "2", label: "Tuesday" },
	{ value: "3", label: "Wednesday" },
	{ value: "4", label: "Thursday" },
	{ value: "5", label: "Friday" },
	{ value: "6", label: "Saturday" },
	{ value: "0", label: "Sunday" },
];

export const DOM_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
	value: String(i + 1),
	label: String(i + 1),
}));

export const DAY_OF_MONTH_OPTIONS = DOM_OPTIONS.map((option) => ({
	value: option.value,
	label: `Day ${option.label}`,
}));

/** One payload for the page and the in-expense dialog, so neither can drift. */
export function toCreateBillPayload(value: BillFormSchema, workspaceId: string) {
	return {
		title: value.title,
		description: value.description,
		amount: value.transaction.value,
		currency: value.transaction.currency,
		repeat: value.repeat,
		walletId: value.walletId,
		categoryId: value.categoryId || null,
		eventId: value.eventId || null,
		workspaceId,
		// The API reads `anchorDate` as a calendar date and appends its own time suffix, so a
		// full ISO instant from the date chip has to be trimmed to `yyyy-MM-dd` first.
		...(value.repeat === "yearly"
			? { anchorDate: value.anchorDate?.slice(0, 10) }
			: { dueDay: value.dueDay ? Number(value.dueDay) : undefined }),
	};
}
