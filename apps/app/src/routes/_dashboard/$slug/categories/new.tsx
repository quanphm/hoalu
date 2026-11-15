import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { CreateCategoryPage } from "#app/components/categories/category-create.tsx";

/**
 * `returnTo` is how another form borrows this page: it comes back with the new id instead of
 * landing on the category, and `transactionType` says which transaction form to come back to.
 */
const searchSchema = z.object({
	type: z.enum(["expense", "income"]).optional(),
	returnTo: z.literal("transaction").optional(),
	transactionType: z.enum(["expense", "income"]).optional(),
});

export const Route = createFileRoute("/_dashboard/$slug/categories/new")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateCategoryPage />;
}
