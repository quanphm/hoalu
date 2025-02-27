import { OpenAPI } from "@hoalu/furnace";
import { describeRoute } from "hono-openapi";
import { createHonoInstance } from "../../lib/create-app";

const app = createHonoInstance();

const route = app.post(
	"/",
	describeRoute({
		tags: ["Images"],
		summary: "Upload image",
		responses: {
			...OpenAPI.unauthorized(),
			...OpenAPI.bad_request(),
			...OpenAPI.server_parse_error(),
		},
	}),
	(c) => {
		return c.json({ message: "hello" });
	},
);

export default route;
