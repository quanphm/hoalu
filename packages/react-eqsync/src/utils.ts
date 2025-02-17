import type { Shape, ShapeStream } from "@electric-sql/client";
import type { Row, ShapeStreamOptions, UseShapeResult } from "./types";

function sortObjectKeys(obj: any): any {
	if (typeof obj !== "object" || obj === null) return obj;

	if (Array.isArray(obj)) {
		return obj.map(sortObjectKeys);
	}

	return (
		Object.keys(obj)
			.sort()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.reduce<Record<string, any>>((sorted, key) => {
				sorted[key] = sortObjectKeys(obj[key]);
				return sorted;
			}, {})
	);
}

function sortedOptionsHash<T>(options: ShapeStreamOptions<T>) {
	return JSON.stringify(sortObjectKeys(options));
}

function parseShapeData<T extends Row<unknown>>(shape: Shape<T>): UseShapeResult<T> {
	return {
		data: shape.currentRows,
		isLoading: shape.isLoading(),
		lastSyncedAt: shape.lastSyncedAt(),
		isError: shape.error !== false,
		error: shape.error,
		shape,
		stream: shape.stream as ShapeStream<T>,
	};
}

export { sortedOptionsHash, parseShapeData };
