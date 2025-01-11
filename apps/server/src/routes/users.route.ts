import { AllUsersSchema, selectAllUsers } from "@/queries/user";
import { generateId } from "@woben/common";
import { StatusCodes } from "@woben/furnace/utils";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/valibot";
import pg from "pg";
import * as v from "valibot";
import { db } from "../db";
import { userTable } from "../db/schema";

const responseSchema = v.object({
	ok: v.boolean(),
	data: AllUsersSchema,
});

export const usersRoute = new Hono()
	.get(
		"/",
		describeRoute({
			description: "Retrieve all users",
			responses: {
				[StatusCodes.OK]: {
					description: "Successful response",
					content: {
						"application/json": { schema: resolver(responseSchema) },
					},
				},
			},
		}),
		async (c) => {
			const result = await selectAllUsers();
			return c.json({
				ok: true,
				data: result,
			});
		},
	)
	.post(
		"/",
		validator(
			"json",
			v.object({
				username: v.pipe(v.string(), v.nonEmpty()),
				email: v.pipe(v.string(), v.nonEmpty(), v.email()),
			}),
			(result, c) => {
				if (!result.success) {
					return c.json(
						{
							ok: false,
							message: "validation failed",
						},
						StatusCodes.BAD_REQUEST,
					);
				}
			},
		),
		async (c) => {
			const userReq = c.req.valid("json");
			const publicId = generateId("user");

			try {
				const result = await db
					.insert(userTable)
					.values({
						public_id: publicId,
						username: userReq.username,
						email: userReq.email,
					})
					.returning({
						id: userTable.id,
						public_id: userTable.public_id,
					});
				return c.json({ ok: true, data: result[0] }, StatusCodes.CREATED);
			} catch (err) {
				if (err instanceof pg.DatabaseError) {
					return c.json({ ok: false, message: err.message }, StatusCodes.BAD_REQUEST);
				}
				return c.json({ ok: false, message: "unknown error" }, StatusCodes.BAD_REQUEST);
			}
		},
	);
