import { Shape, ShapeStream } from "@electric-sql/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { EqSyncClientContext } from "./context";
import type {
	AppShapeOptions,
	GetExtensions,
	Row,
	ShapeStreamOptions,
	UseShapeResult,
} from "./types";
import { parseShapeData, sortedOptionsHash } from "./utils";

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
		const stream = streamCache.get(shapeHash)! as ShapeStream<T>;
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
			return shapeCache.get(shapeStream)! as Shape<T>;
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

function useEqSyncShape<T extends Row<unknown> = Row, S = UseShapeResult<T>>({
	syncKey,
	optionsFn,
}: {
	syncKey: string[];
	optionsFn: () => Promise<AppShapeOptions<T, S>>;
}) {
	const eqSyncClient = useEqSync();
	const queryClient = useQueryClient();
	const [controller, _] = React.useState(new AbortController());

	const queryKey = syncKey[0] !== "sync" ? ["sync", ...syncKey] : syncKey;
	const { data: options } = useQuery({
		queryKey,
		queryFn: () => optionsFn(),
	});
	const [data, setData] = React.useState<UseShapeResult<T>>({
		data: [] as T[],
		isLoading: false,
		isError: false,
	});

	React.useEffect(() => {
		if (!options) {
			return;
		}

		const shapeStream = getShapeStream<T>({
			...options,
			url: eqSyncClient.baseUrl,
			signal: controller.signal,
			fetchClient: (req, init) => fetch(req, { ...init, credentials: "include" }),
		} as ShapeStreamOptions<GetExtensions<T>>);
		const shape = getShape<T>(shapeStream);
		const unsubscribe = shape.subscribe((data) => {
			const latestShapeData = parseShapeData(shape);
			setData(latestShapeData);
		});

		return () => {
			unsubscribe();
		};
	}, [options, eqSyncClient.baseUrl, controller.signal]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: bypass
	React.useEffect(() => {
		return () => {
			queryClient.cancelQueries({ queryKey });
			controller.abort();
		};
	}, []);

	return data;
}

function useEqSync() {
	const context = React.useContext(EqSyncClientContext);
	if (!context) {
		throw new Error("useEqSync must be use inside <EqSyncClientProvider> component.");
	}
	return context;
}

export { useEqSyncShape, useEqSync };
