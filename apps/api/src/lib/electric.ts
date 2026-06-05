import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";

export function prepareElectricUrl(requestUrl: string): URL {
	const shapeUrl = new URL(`${process.env.SYNC_URL}/v1/shape`);
	const searchParams = new URL(requestUrl).searchParams;

	searchParams.forEach((value, key) => {
		if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
			shapeUrl.searchParams.set(key, value);
		}
	});

	/**
	 * ELECTRIC_SECRET - required
	 * @see https://github.com/electric-sql/electric/blob/main/website/electric-api.yaml#L20
	 */
	shapeUrl.searchParams.set("secret", process.env.SYNC_SECRET);

	return shapeUrl;
}

/**
 * @see https://electric-sql.com/docs/api/http#control-messages
 */
type Data = {
	headers: Record<string, string> & {
		control?: "up-to-date" | "must-refetch" | "snapshot-end";
	};
};
export async function proxyElectricRequest(originUrl: URL): Promise<Response> {
	const response = await fetch(originUrl);
	const headers = new Headers(response.headers);

	headers.delete(`content-encoding`);
	headers.delete(`content-length`);
	headers.set(`vary`, `cookie`);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
