const SYNC_URL = `${import.meta.env.PUBLIC_API_URL}/sync`;

export const tasksShapeOptions = () => ({
	url: SYNC_URL,
	params: {
		table: "task",
	},
});
