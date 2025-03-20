import type { Shape, ShapeStream } from "@electric-sql/client";
import type { Row, ShapeStreamOptions, UseShapeResult } from "./types";

function sortObjectKeys(obj: any): any {
	if (typeof obj !== "object" || obj === null) return obj;

	if (Array.isArray(obj)) return obj.map(sortObjectKeys);

	return Object.keys(obj)
		.sort()
		.reduce<Record<string, any>>((sorted, key) => {
			sorted[key] = sortObjectKeys(obj[key]);
			return sorted;
		}, {});
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

function shapeResultChanged<T extends Row<unknown>>(
	oldRes: UseShapeResult<T> | undefined,
	newRes: UseShapeResult<T>,
) {
	return (
		!oldRes ||
		oldRes.isLoading !== newRes.isLoading ||
		oldRes.lastSyncedAt !== newRes.lastSyncedAt ||
		oldRes.isError !== newRes.isError ||
		oldRes.error !== newRes.error ||
		oldRes.shape.lastOffset !== newRes.shape.lastOffset ||
		oldRes.shape.handle !== newRes.shape.handle
	);
}

export { sortedOptionsHash, parseShapeData, shapeResultChanged };
