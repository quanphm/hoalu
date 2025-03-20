import { Shape, ShapeStream } from "@electric-sql/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { DokiClientContext } from "./context";
import type {
	AppShapeOptions,
	GetExtensions,
	Row,
	ShapeStreamOptions,
	UseShapeResult,
} from "./types";
import { parseShapeData, shapeResultChanged, sortedOptionsHash } from "./utils";

type UnknownShape = Shape<Row<unknown>>;
type UnknownShapeStream = ShapeStream<Row<unknown>>;

const streamCache = new Map<string, UnknownShapeStream>();
const shapeCache = new Map<UnknownShapeStream, UnknownShape>();

function getShapeStream<T extends Row<unknown>>(
	options: ShapeStreamOptions<GetExtensions<T>>,
): ShapeStream<T> {
	const shapeHash = sortedOptionsHash(options);

	// If the stream is already cached, return it if valid
	if (streamCache.has(shapeHash)) {
		const stream = streamCache.get(shapeHash) as ShapeStream<T>;
		if (!stream.options.signal?.aborted) {
			return stream;
		}
		// if stream is aborted, remove it and related shapes
		streamCache.delete(shapeHash);
		shapeCache.delete(stream);
	}

	const newShapeStream = new ShapeStream<T>(options);
	streamCache.set(shapeHash, newShapeStream);

	return newShapeStream;
}

function getShape<T extends Row<unknown>>(shapeStream: ShapeStream<T>): Shape<T> {
	// If the stream is already cached, return it if valid
	if (shapeCache.has(shapeStream)) {
		if (!shapeStream.options.signal?.aborted) {
			return shapeCache.get(shapeStream) as Shape<T>;
		}
		// if stream is aborted, remove it and related shapes
		streamCache.delete(sortedOptionsHash(shapeStream.options));
		shapeCache.delete(shapeStream);
	}

	const newShape = new Shape<T>(shapeStream);
	shapeCache.set(shapeStream, newShape);

	// Return the created shape
	return newShape;
}

function useDokiShape<T extends Row<unknown> = Row, S = UseShapeResult<T>>({
	syncKey,
	optionsFn,
}: {
	syncKey: readonly string[];
	optionsFn: () => Promise<AppShapeOptions<T, S>>;
}) {
	const syncClient = useDoki();
	const queryClient = useQueryClient();

	const queryKey = syncKey[0] !== "sync" ? ["sync", ...syncKey] : syncKey;
	const { data: options } = useQuery({
		queryKey,
		queryFn: () => optionsFn(),
	});

	const [controller, _] = React.useState(new AbortController());
	const [data, setData] = React.useState<Pick<UseShapeResult<T>, "data" | "isLoading" | "isError">>(
		{
			data: [] as T[],
			isLoading: false,
			isError: false,
		},
	);
	const latestShapeData = React.useRef<UseShapeResult<T> | undefined>(undefined);

	React.useEffect(() => {
		if (!options) return;

		const shapeStream = getShapeStream<T>({
			...options,
			url: syncClient.baseUrl,
			signal: controller.signal,
			fetchClient: (req, init) => fetch(req, { ...init, credentials: "include" }),
		} as ShapeStreamOptions<GetExtensions<T>>);
		const shape = getShape<T>(shapeStream);

		const unsubscribe = shape.subscribe((_data) => {
			/**
			 * @see https://github.com/electric-sql/electric/pull/2408
			 */
			const newShapeData = parseShapeData(shape);
			if (shapeResultChanged(latestShapeData.current, newShapeData)) {
				latestShapeData.current = newShapeData;
				setData(newShapeData);
			}
		});

		return () => {
			unsubscribe();
		};
	}, [options, syncClient.baseUrl, controller.signal]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: bypass
	React.useEffect(() => {
		return () => {
			queryClient.cancelQueries({ queryKey });
			controller.abort();
		};
	}, [queryKey]);

	return data;
}

function useDoki() {
	const context = React.useContext(DokiClientContext);
	if (!context) {
		throw new Error("useDoki must be use inside <DokiClientProvider> component.");
	}
	return context;
}

export { useDokiShape, useDoki };
