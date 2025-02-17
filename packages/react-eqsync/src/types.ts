import type {
	GetExtensions,
	Row,
	Shape,
	ShapeStream,
	ShapeStreamOptions,
} from "@electric-sql/client";

/**
 * @see https://github.com/electric-sql/electric/blob/main/packages/react-hooks/src/react-hooks.tsx#L94C1-L116C2
 */
interface UseShapeResult<T extends Row<unknown> = Row> {
	/** The array of rows that make up the Shape */
	data: T[];
	/** The Shape instance used by this useShape */
	shape?: Shape<T>;
	/** The ShapeStream instance used by this Shape */
	stream?: ShapeStream<T>;
	/** True during initial fetch. False afterwise */
	isLoading: boolean;
	error?: Shape<T>[`error`];
	isError: boolean;
	/** Unix time at which we last synced. Undefined when `isLoading` is true */
	lastSyncedAt?: number;
}

interface AppShapeOptions<T extends Row<unknown>, S = UseShapeResult<T>>
	extends Omit<ShapeStreamOptions<GetExtensions<T>>, "url"> {
	url?: string;
	selector?: (value: UseShapeResult<T>) => Selection;
}

export type {
	// custom export
	AppShapeOptions,
	UseShapeResult,
	// re-export
	GetExtensions,
	Row,
	ShapeStreamOptions,
};
