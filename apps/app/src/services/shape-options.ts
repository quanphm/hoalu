const SYNC_URL = `${import.meta.env.PUBLIC_API_URL}/sync`;

export const userShapeOptions = () => ({
	url: SYNC_URL,
	params: {
		table: "user",
	},
});
