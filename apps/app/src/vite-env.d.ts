/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference lib="webworker" />

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

declare module "@tanstack/react-table" {
	interface TableMeta<TFeatures = any, TData = any> {
		getRowClassName?: (row: Row<TFeatures, TData>) => string;
	}

	interface ColumnMeta<TFeatures = any, TData = any, TValue = any> {
		headerClassName?: string;
		cellClassName?: string;
		label?: string;
	}
}
