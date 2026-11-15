import * as z from "zod";

export const EventFormSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	budgetTransaction: z
		.object({
			value: z.number(),
			currency: z.string(),
		})
		.optional(),
	status: z.enum(["open", "closed"]).optional(),
});

export type EventFormSchema = z.infer<typeof EventFormSchema>;

export const EVENT_STATUS_OPTIONS: { label: string; value: string }[] = [
	{ label: "Open", value: "open" },
	{ label: "Closed", value: "closed" },
];

export function toCreateEventPayload(value: EventFormSchema) {
	return {
		title: value.title,
		description: value.description,
		startDate: value.startDate || undefined,
		endDate: value.endDate || undefined,
		budget: value.budgetTransaction?.value,
		currency: value.budgetTransaction?.currency,
	};
}

export function toUpdateEventPayload(value: EventFormSchema) {
	return {
		...toCreateEventPayload(value),
		status: value.status,
	};
}
