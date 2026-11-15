import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { CreateRecurringBillPage } from "#app/components/recurring-bills/recurring-bill-create.tsx";

/** `returnTo` lets the transaction form borrow this page and get the new bill back. */
const searchSchema = z.object({
	returnTo: z.literal("transaction").optional(),
});

export const Route = createFileRoute("/_dashboard/$slug/recurring-bills/new")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateRecurringBillPage />;
}
