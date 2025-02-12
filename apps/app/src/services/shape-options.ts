import type { AppShapeOptions } from "@/hooks/use-sync-shape";
import type { Row } from "@electric-sql/client";
import type { UseShapeResult } from "@electric-sql/react";

const SYNC_URL = `${import.meta.env.PUBLIC_API_URL}/sync`;

export const tasksShapeOptions = <T extends Row<unknown>, S = UseShapeResult<T>>({
	workspaceId,
}: { workspaceId: string }): AppShapeOptions<T, S> => ({
	url: SYNC_URL,
	params: {
		table: "task",
		where: `workspace_id = \'${workspaceId}\'`,
		columns: ["id", "name", "done", "creator_id", "created_at"],
	},
	fetchClient: (req, init) => fetch(req, { ...init, credentials: "include" }),
});
