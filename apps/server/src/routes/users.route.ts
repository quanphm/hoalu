import { createHonoInstance } from "@/lib/create-app";
import { AllUsersSchema, selectAllUsers } from "@/queries/user";
import { StatusCodes } from "@woben/furnace/utils";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/valibot";
import { cors } from "hono/cors";
import * as v from "valibot";

const app = createHonoInstance();

app.use(cors());

export const usersRoute = app.get(
	"/",
	describeRoute({
		description: "Retrieve all users",
		responses: {
			[StatusCodes.OK]: {
				description: "Successful response",
				content: {
					"application/json": {
						schema: resolver(
							v.object({
								ok: v.boolean(),
								data: AllUsersSchema,
							}),
						),
					},
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
);
