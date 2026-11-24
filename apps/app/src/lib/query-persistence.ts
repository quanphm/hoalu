import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Query } from "@tanstack/react-query";
import {
	persistQueryClientRestore,
	persistQueryClientSubscribe,
} from "@tanstack/react-query-persist-client";

import { queryClient } from "#app/lib/query-client.ts";

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

/** Workspace detail, members and invitations are what the app shell needs offline. */
const SHELL_WORKSPACE_SEGMENTS = new Set(["members", "active", "invitations"]);

const persister = createAsyncStoragePersister({
	key: "hoalu.query-cache",
	storage: typeof window === "undefined" ? undefined : window.localStorage,
	throttleTime: 1_000,
});

function shouldPersist(query: Query) {
	if (query.state.status !== "success") return false;

	const [root, , segment] = query.queryKey as [string, string | undefined, string | undefined];
	// A signed-out session must never be restored: it would shadow the live
	// session and bounce the user back to the login screen.
	if (root === "session") return Boolean(query.state.data);
	if (root !== "workspaces") return false;
	return segment === undefined || SHELL_WORKSPACE_SEGMENTS.has(segment);
}

/**
 * Restores the shell queries (session + workspace) so an offline reload can get
 * past the auth gate and render the workspace before any network request.
 */
export async function initQueryPersistence(): Promise<void> {
	if (typeof window === "undefined") return;

	const options = {
		queryClient,
		persister,
		maxAge: WEEK_IN_MS,
		dehydrateOptions: { shouldDehydrateQuery: shouldPersist },
	};

	try {
		await persistQueryClientRestore(options);
		persistQueryClientSubscribe(options);
	} catch (error) {
		console.warn("[persistence] could not restore the query cache:", error);
	}
}
