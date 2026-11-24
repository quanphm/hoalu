import { toastManager } from "@hoalu/ui/toast";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { WorkspaceActionProvider } from "#app/components/providers/workspace-action-provider.tsx";
import {
	categoryCollectionFactory,
	exchangeRateCollectionFactory,
	expenseCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { getOfflineExecutor } from "#app/lib/offline/executor.ts";
import { getWorkspaceDetailsOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		const expenseCollection = expenseCollectionFactory(slug);
		const categoryCollection = categoryCollectionFactory(slug);
		const walletCollection = walletCollectionFactory(slug);

		await Promise.all([
			queryClient.ensureQueryData(getWorkspaceDetailsOptions(slug)),
			expenseCollection.preload(),
			categoryCollection.preload(),
			walletCollection.preload(),
			exchangeRateCollectionFactory().preload(),
		]);

		// Restores optimistic rows that a previous session left in the outbox.
		// Without this the executor only exists once a mutation hook renders,
		// so a reload would show the synced rows but drop the pending writes.
		await getOfflineExecutor(slug).waitForInit();
	},
	onError: (error) => {
		console.error("[workspace route] loader failed", error);
		toastManager.add({
			title: "Something went wrong.",
			description: error.message,
			type: "error",
		});
		throw redirect({ to: "/" });
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<WorkspaceActionProvider>
			<Outlet />
		</WorkspaceActionProvider>
	);
}
