import { db } from "@/db";
import { userTable } from "@/db/schema";
import { vValidator } from "@hono/valibot-validator";
import { generateId } from "@woben/common";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DatabaseError } from "pg";
import * as v from "valibot";

export const api = new Hono();

api.use("/*", cors());

api.get("/users", async (c) => {
	const result = await db
		.select({
			id: userTable.id,
			username: userTable.username,
			public_id: userTable.public_id,
		})
		.from(userTable);

	return c.json({
		ok: true,
		data: result,
	});
});

api.post(
	"/users",
	vValidator(
		"json",
		v.object({
			username: v.pipe(v.string(), v.nonEmpty()),
			email: v.pipe(v.string(), v.nonEmpty(), v.email()),
		}),
		(result, c) => {
			if (!result.success) {
				console.log(result.issues);
				return c.json(
					{
						ok: false,
						message: "invalid",
					},
					400,
				);
			}
		},
	),
	async (c) => {
		const userReq = await c.req.json();
		const publicId = generateId("user");
		try {
			await db.insert(userTable).values({
				public_id: publicId,
				username: userReq.username,
				email: userReq.email,
			});
			return c.json({ ok: true }, 201);
		} catch (err) {
			if (err instanceof DatabaseError) {
				return c.json({ ok: false, message: err.message }, 400);
			}
			return c.json({ ok: false }, 400);
		}
	},
);
