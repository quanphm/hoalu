import { cors } from "hono/cors";

// import { authGuard } from "@hoalu/furnace";

import { HTTPStatus } from "@hoalu/common/http-status";

import { createHonoInstance } from "#api/lib/create-app.ts";

export function syncModule() {
	const app = createHonoInstance()
		.basePath("/sync")
		.use(
			cors({
				origin: [process.env.PUBLIC_APP_BASE_URL],
				exposeHeaders: [
					"electric-cursor",
					"electric-handle",
					"electric-offset",
					"electric-schema",
					"electric-up-to-date",
				],
				credentials: true,
			}),
		)
		// .use(authGuard())
		.get("/", async (c) => {
			const shapeUrl = new URL(`${process.env.SYNC_URL}/v1/shape`);

			const searchParams = new URL(c.req.url).searchParams;
			searchParams.forEach((value, key) => {
				shapeUrl.searchParams.set(key, value);
			});
			/**
			 * ELECTRIC_SECRET - required
			 * @see https://github.com/electric-sql/electric/blob/main/website/electric-api.yaml#L20
			 */
			shapeUrl.searchParams.set("secret", process.env.SYNC_SECRET);

			const response = await fetch(shapeUrl);
			console.log(response.status);

			const headers = response.headers;
			headers.delete(`content-encoding`);
			headers.delete(`content-length`);
			headers.set(`vary`, `cookie`);

			if (response.status === HTTPStatus.codes.NO_CONTENT) {
				headers.set("electric-up-to-date", "");
				return c.body(null, HTTPStatus.codes.NO_CONTENT, headers.toJSON());
			}

			if (response.status > 204) {
				console.error("Error: ", response.status);
				return c.json({ ok: false }, HTTPStatus.codes.BAD_REQUEST);
			}

			/**
			 * @see https://electric-sql.com/docs/api/http#control-messages
			 */
			type Data = {
				headers: Record<string, string> & {
					control?: "up-to-date" | "must-refetch" | "snapshot-end";
				};
			}[];

			const data: Data = await response.json();
			const isUpToDate = data.find((d) => d.headers?.control === "up-to-date");
			if (isUpToDate) {
				headers.set("electric-up-to-date", "");
			}

			return c.json(data, HTTPStatus.codes.OK, headers.toJSON());
		});

	return app;
}
