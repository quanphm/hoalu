import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { toastManager } from "@hoalu/ui/toast";

import { PageContent } from "#app/components/layouts/page-content.tsx";
import { WorkspaceActionProvider } from "#app/components/providers/workspace-action-provider.tsx";
import { categoryCollection } from "#app/lib/collections/category.ts";
import { expenseCollection } from "#app/lib/collections/expense.ts";
import { walletCollection } from "#app/lib/collections/wallet.ts";
import { workspaceKeys } from "#app/lib/query-key-factory.ts";
import {
	filesQueryOptions,
	getActiveMemberOptions,
	getWorkspaceDetailsOptions,
	walletsQueryOptions,
} from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		// [Important] other queries need data from this query
		await queryClient.ensureQueryData(getWorkspaceDetailsOptions(slug));

		const workspace = queryClient.getQueryData<{ id: string }>(workspaceKeys.withSlug(slug));
		if (workspace) {
			await Promise.all([
				expenseCollection(workspace.id).preload(),
				categoryCollection(workspace.id).preload(),
				walletCollection(workspace.id).preload(),
			]);
		}

		await Promise.all([
			queryClient.ensureQueryData(getActiveMemberOptions(slug)),
			queryClient.ensureQueryData(walletsQueryOptions(slug)),
			queryClient.ensureQueryData(filesQueryOptions(slug)),
		]);
	},
	onError: (error) => {
		toastManager.add({
			title: "Uh oh! Something went wrong.",
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
			<PageContent>
				<Outlet />
			</PageContent>
		</WorkspaceActionProvider>
	);
}
