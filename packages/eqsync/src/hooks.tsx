import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { AppShapeOptions, Row, UseShapeResult } from "./types";

const SYNC_URL = `${import.meta.env.PUBLIC_API_URL}/sync`;

function useShapeQuery<T extends Row<unknown> = Row, S = UseShapeResult<T>>({
	syncKey,
	optionsFn,
}: {
	syncKey: string[];
	optionsFn: () => Promise<AppShapeOptions<T, S>>;
}) {
	const abortController = new AbortController();
	const queryKey = syncKey[0] !== "sync" ? ["sync", ...syncKey] : syncKey;
	const { data: options } = useQuery({
		queryKey,
		queryFn: () => optionsFn(),
	});

	useEffect(() => {
		return () => {
			// queryClient.cancelQueries({ queryKey });
			abortController.abort();
		};
	}, []);

	// const shapeData = useShape<T>({
	// 	url: options?.url || SYNC_URL,
	// 	params: options?.params || {},
	// 	signal: abortController.signal,
	// 	fetchClient: (req, init) => fetch(req, { ...init, credentials: "include" }),
	// });

	// return { data: shapeData.data, isLoading: shapeData.isLoading, isError: shapeData.isError };
}

export { useShapeQuery };
