import { Hono } from "hono";
import { db } from "./db";
import { userTable } from "./db/schema";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/users", async (c) => {
	const result = await db
		.select({
			id: userTable.id,
			username: userTable.username,
			public_id: userTable.public_id,
		})
		.from(userTable);

	return c.json({
		data: result,
	});
});

export default app;
