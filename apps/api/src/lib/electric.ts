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
export async function proxyElectricRequest(originUrl: URL): Promise<[Data[], Headers]> {
	const response = await fetch(originUrl);
	const headers = response.headers;

	headers.delete(`content-encoding`);
	headers.delete(`content-length`);
	headers.set(`vary`, `cookie`);

	const data: Data[] = await response.json();
	const endOfDataResponse = data[data.length - 1];

	/**
	 * Bun.fetch can not attach `electric-up-to-date` from Electric proxy.
	 * Manually check the response data.
	 */
	const isUpToDate = endOfDataResponse.headers.control === "up-to-date";
	if (isUpToDate) {
		headers.set("electric-up-to-date", "");
	}

	return [data, headers];
}
