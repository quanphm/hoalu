import type { AppShapeOptions, Row, UseShapeResult } from "@/hooks/use-sync-shape";
import { notFound } from "@tanstack/react-router";
import { type } from "arktype";

export const withWorkspaceId = <T extends Row<unknown>, S = UseShapeResult<T>>(
	handler: (...params: any) => AppShapeOptions<T, S>,
) => {
	const { state } = window.getRouter();
	const id = "/_dashboard/$slug";
	const match = state.matches.find((route) => route.routeId === id);
	if (match === undefined) throw notFound();

	const { workspace } = match.loaderData;
	if (!workspace) throw notFound();

	const workspaceSchema = type({
		id: "string.uuid",
		name: "string > 0",
		slug: "string > 0",
	});

	const result = workspaceSchema(workspace);
	if (result instanceof type.errors) {
		throw new Error(result.summary);
	}

	return handler({ id: workspace.id, name: workspace.name, slug: workspace.slug });
};

export const tasksShapeOptions = <T extends Row<unknown>, S = UseShapeResult<T>>({
	id,
}: { id: string }): AppShapeOptions<T, S> => ({
	params: {
		table: "task",
		where: `workspace_id = \'${id}\'`,
		columns: ["id", "name", "done", "creator_id", "created_at"],
	},
});
