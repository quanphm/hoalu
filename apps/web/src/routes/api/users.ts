import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/users")({
	GET: async () => {
		return json({ ok: true });
	},
});
