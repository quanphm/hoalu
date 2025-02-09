import type { ShapeStreamOptions } from "@electric-sql/client";

const SYNC_URL = `${import.meta.env.PUBLIC_API_URL}/sync`;

export const tasksShapeOptions = ({
	workspaceId,
}: { workspaceId: string }): ShapeStreamOptions => ({
	url: SYNC_URL,
	params: {
		table: "task",
		where: `workspace_id = \'${workspaceId}\'`,
		columns: ["id", "name", "done", "creator_id", "created_at"],
	},
});
