import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { CreateExpenseForm } from "#app/components/transactions/expense-form.tsx";
import { CreateIncomeForm } from "#app/components/transactions/income-form.tsx";

const searchSchema = z.object({
	type: z.enum(["expense", "income"]).optional(),
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
