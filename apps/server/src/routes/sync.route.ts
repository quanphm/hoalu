import { Hono } from "hono";

export const syncRoute = new Hono().get("/", async (c) => {
	const shapeUrl = new URL(`${process.env.SYNC_URL}/v1/shape`);

	const searchParams = new URL(c.req.url).searchParams;
	searchParams.forEach((value, key) => {
		shapeUrl.searchParams.set(key, value);
	});

	const electricResponse = await fetch(shapeUrl.toString());

	if (electricResponse.status > 204) {
		console.error("Error: ", electricResponse.status);
		return c.json(
			{
				ok: false,
			},
			400,
		);
	}

	const electricHeaders = new Headers(electricResponse.headers);

	if (electricResponse.status === 204) {
		electricHeaders.set("electric-up-to-date", "");
		return c.body(null, 204, {
			...Object.fromEntries(electricResponse.headers),
		});
	}

	const data: any = await electricResponse.json();

	if (electricHeaders.get("content-encoding")) {
		electricHeaders.delete("content-encoding");
		electricHeaders.delete("content-length");
	}

	const isUpToDate = data.find((d: any) => d?.headers.control === "up-to-date");
	if (isUpToDate) {
		electricHeaders.set("electric-up-to-date", "");
	}

	return c.json(data, 200, {
		...Object.fromEntries(electricHeaders),
	});
});
