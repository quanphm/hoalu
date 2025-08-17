import { notFound } from "@tanstack/react-router";
import { type } from "arktype";

import type { AppShapeOptions, Row } from "@hoalu/doki";
import { queryClient } from "@/lib/query-client";
import { getWorkspaceDetailsOptions } from "@/services/query-options";

const WorkspaceSchema = type({
	id: "string.uuid",
	name: "string > 0",
	slug: "string > 0",
});
type WorkspaceSchema = typeof WorkspaceSchema.inferOut;

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

	const result = WorkspaceSchema(workspace);
	if (result instanceof type.errors) {
		throw new Error(result.summary);
	}

	return handler(result);
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
