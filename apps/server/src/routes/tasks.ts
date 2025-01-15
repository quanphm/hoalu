import { createHonoInstance } from "@/lib/create-app";
import { StatusCodes } from "@woben/furnace/utils";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/valibot";
import { cors } from "hono/cors";
import * as v from "valibot";

const app = createHonoInstance();

app.use(cors());

export const tasksRoute = app.get(
	"/",
	describeRoute({
		description: "Retrieve all tasks",
		responses: {
			[StatusCodes.OK]: {
				description: "Successful response",
				content: {
					"application/json": {
						schema: resolver(
							v.object({
								ok: v.boolean(),
								data: v.array(v.any()),
							}),
						),
					},
				},
			},
		},
	}),
	async (c) => {
		return c.json({
			ok: true,
			data: [],
		});
	},
);
