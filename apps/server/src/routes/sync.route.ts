import { Hono } from "hono";
import { timeout } from "hono/timeout";

export const syncRoute = new Hono().get("/", timeout(60000), async (c) => {
	try {
		const shapeUrl = new URL(`${process.env.SYNC_URL}/v1/shape`);

		const searchParams = new URL(c.req.url).searchParams;
		searchParams.forEach((value, key) => {
			if ([`live`, `table`, `handle`, `offset`, `cursor`].includes(key)) {
				shapeUrl.searchParams.set(key, value);
			}
		});

		const resp = await fetch(shapeUrl.toString());

		// forward electric headers
		const headers = new Headers(resp.headers);
		if (resp.headers.get("content-encoding")) {
			headers.delete("content-encoding");
			headers.delete("content-length");
		}
		for (const [name, value] of headers.entries()) {
			c.header(name, value);
		}

		if (resp.status === 204) {
			c.status(204);
			return c.body(null);
		}
		return resp;
	} catch (error) {
		console.error("Error proxying shape request:", error);
		return c.json({ error: "Failed to fetch schema from Electric" }, 500);
	}
});
