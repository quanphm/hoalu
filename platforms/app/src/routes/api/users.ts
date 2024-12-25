import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/users")({
	GET: async () => {
		const users = await db.select().from(userTable);
		return json({ users });
	},
});
