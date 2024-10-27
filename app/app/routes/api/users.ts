import { db } from "@/lib/database";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const Route = createAPIFileRoute("/api/users")({
	GET: async () => {
		const result = await db.api.selectFrom("user").selectAll().execute();
		return json({
			data: result,
		});
	},
});
