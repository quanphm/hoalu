import { db } from "@/lib/database";
import { userTable } from "@/lib/database/schema";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const Route = createAPIFileRoute("/api/users")({
	GET: async () => {
		const users = await db.select().from(userTable);
		return json({ users });
	},
});
