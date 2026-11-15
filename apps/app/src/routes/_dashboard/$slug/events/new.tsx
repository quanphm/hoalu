import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { CreateEventPage } from "#app/components/events/event-create.tsx";

/**
 * `returnTo` is how another form borrows this page: it comes back with the new id instead of
 * landing on the event, and `type` says which transaction form to come back to.
 */
const searchSchema = z.object({
	returnTo: z.literal("transaction").optional(),
	type: z.enum(["expense", "income"]).optional(),
});

export const Route = createFileRoute("/_dashboard/$slug/events/new")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateEventPage />;
}
