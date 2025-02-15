import type { GetExtensions, Row, ShapeStreamOptions } from "@electric-sql/client";
import { type UseShapeResult, preloadShape, useShape } from "@electric-sql/react";

const SYNC_URL = `${import.meta.env.PUBLIC_API_URL}/sync`;

interface UseShapeOptions<SourceData extends Row<unknown>, Selection>
	extends ShapeStreamOptions<GetExtensions<SourceData>> {
	selector?: (value: UseShapeResult<SourceData>) => Selection;
}

interface AppShapeOptions<T extends Row<unknown>, S = UseShapeResult<T>>
	extends Omit<UseShapeOptions<T, S>, "url"> {
	url?: string;
}

function useSyncShape<
	SourceData extends Row<unknown> = Row,
	Selection = UseShapeResult<SourceData>,
>(options: AppShapeOptions<SourceData, Selection>) {
	const abortController = new AbortController();
	const signal = abortController.signal;

	const mergedOptions = {
		...options,
		url: options.url || SYNC_URL,
		signal,
		fetchClient: (req, init) => fetch(req, { ...init, credentials: "include" }),
	} satisfies UseShapeOptions<SourceData, Selection>;

	// @ts-ignore: `exactOptionalPropertyTypes`
	// The rules above used for ArkType validation within the application.
	// Skip the rule on library codes.
	const shapeData = useShape(mergedOptions);

	//useEffect(() => {
	//	return () => {
	//		abortController.abort();
	//	};
	//}, []);

	return shapeData;
}

async function preloadSyncShape<T extends Row<unknown> = Row>(options: AppShapeOptions<T>) {
	// @ts-ignore: `exactOptionalPropertyTypes`
	return preloadShape({
		...options,
		url: options.url || SYNC_URL,
		fetchClient: (req, init) => fetch(req, { ...init, credentials: "include" }),
	});
}

export type { Row, AppShapeOptions, UseShapeResult };
export { useSyncShape, preloadSyncShape };
