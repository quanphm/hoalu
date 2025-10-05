import { notFound } from "@tanstack/react-router";
import * as z from "zod";

import type { AppShapeOptions, Row } from "@hoalu/doki";
import { queryClient } from "@/lib/query-client";
import { getWorkspaceDetailsOptions } from "@/services/query-options";

const WorkspaceSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	slug: z.string().min(1),
});
type WorkspaceSchema = z.infer<typeof WorkspaceSchema>;

export const withWorkspace = async <T extends Row<unknown>>(
	handler: (params: WorkspaceSchema) => AppShapeOptions<T>,
) => {
	const { state } = window.getRouter();
	const id = "/_dashboard/$slug";

	const match = state.matches.find((route) => route.routeId === id);
	if (match === undefined) throw notFound();

	const { params } = match;
	const workspace = await queryClient.ensureQueryData(getWorkspaceDetailsOptions(params.slug));
	if (!workspace) throw notFound();

	const result = WorkspaceSchema.safeParse(workspace);
	if (!result.success) {
		throw new Error(result.error.message);
	}

	return handler(result.data);
};

export const tasksShapeOptions = <T extends Row<unknown>>({
	id,
}: {
	id: string;
}): AppShapeOptions<T> => ({
	params: {
		table: "task",
		where: `workspace_id = '${id}'`,
		columns: [
			"id",
			"title",
			"description",
			"status",
			"priority",
			"due_date",
			"creator_id",
			"created_at",
		],
	},
});
