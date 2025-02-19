/// <reference types="vite/client" />

import type { EnvSchema } from "./lib/env";
import "@tanstack/react-table";

interface ViteBuiltInEnv {
	MODE: "development" | "production";
	BASE_URL: string;
	SSR: boolean;
	DEV: boolean;
	PROD: boolean;
}

declare global {
	interface ImportMetaEnv extends EnvSchema, ViteBuiltInEnv {}
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

// https://github.com/openstatusHQ/data-table-filters/blob/main/src/react-table.d.ts
declare module "@tanstack/react-table" {
	// https://github.com/TanStack/table/issues/44#issuecomment-1377024296
	interface TableMeta<TData> {
		getRowClassName?: (row: Row<TData>) => string;
	}

	interface ColumnMeta {
		headerClassName?: string;
		cellClassName?: string;
		label?: string;
	}

	interface FilterFns {
		inDateRange?: FilterFn<any>;
		arrSome?: FilterFn<any>;
	}

	// https://github.com/TanStack/table/discussions/4554
	interface ColumnFiltersOptions<TData extends RowData> {
		filterFns?: Record<string, FilterFn<TData>>;
	}
}
