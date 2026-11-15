import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { CreateExpenseForm } from "#app/components/transactions/expense-form.tsx";
import { CreateIncomeForm } from "#app/components/transactions/income-form.tsx";

/**
 * The ids are how a create page hands its result back: /transactions/new?categoryId=<new>
 * lands with that choice already made, on top of whatever the draft restored.
 */
const searchSchema = z.object({
	type: z.enum(["expense", "income"]).optional(),
	categoryId: z.string().optional(),
	eventId: z.string().optional(),
	recurringBillId: z.string().optional(),
});

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue/transactions/new")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { type } = Route.useSearch();

	if (type === "income") {
		return <CreateIncomeForm />;
	}
	return <CreateExpenseForm />;
}
