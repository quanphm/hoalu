import {
	BrowserCollectionCoordinator,
	createBrowserWASQLitePersistence,
	openBrowserWASQLiteOPFSDatabase,
} from "@tanstack/browser-db-sqlite-persistence";
import type { PersistedCollectionPersistence } from "@tanstack/browser-db-sqlite-persistence";

const DATABASE_NAME = "hoalu.sqlite";
const COORDINATOR_NAME = "hoalu-db";

export const SCHEMA_VERSION = 1;

export const INITIAL_RENDER = {
	strategy: "network-first",
	networkTimeoutMs: 2_000,
} as const;

let persistence: PersistedCollectionPersistence | null = null;
let database: { close?: () => Promise<void> | void } | null = null;
let coordinator: BrowserCollectionCoordinator | null = null;
let initPromise: Promise<void> | null = null;

async function open(): Promise<void> {
	try {
		const opened = await openBrowserWASQLiteOPFSDatabase({ databaseName: DATABASE_NAME });
		database = opened;
		coordinator = new BrowserCollectionCoordinator({ dbName: COORDINATOR_NAME });
		persistence = createBrowserWASQLitePersistence({
			database: opened,
			coordinator,
		});
	} catch (error) {
		persistence = null;
		console.warn(
			"[persistence] local SQLite is unavailable, collections will not survive a reload:",
			error,
		);
	}
}

export function initPersistence(): Promise<void> {
	initPromise ??= open();
	return initPromise;
}

export function getPersistence(): PersistedCollectionPersistence | null {
	return persistence;
}

export function hasPersistence(): boolean {
	return persistence !== null;
}

export async function closePersistence(): Promise<void> {
	coordinator?.dispose();
	coordinator = null;
	await database?.close?.();
	database = null;
	persistence = null;
	initPromise = null;
}
