import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { toastManager } from "@hoalu/ui/toast";

import { PageContent } from "#app/components/layouts/page-content.tsx";
import { WorkspaceActionProvider } from "#app/components/providers/workspace-action-provider.tsx";
import {
	categoriesQueryOptions,
	expensesQueryOptions,
	filesQueryOptions,
	getActiveMemberOptions,
	getWorkspaceDetailsOptions,
	tasksQueryOptions,
	walletsQueryOptions,
} from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		// [Important] other queries need data from this query
		await queryClient.ensureQueryData(getWorkspaceDetailsOptions(slug));

		await Promise.all([
			queryClient.ensureQueryData(getActiveMemberOptions(slug)),
			queryClient.ensureQueryData(walletsQueryOptions(slug)),
			queryClient.ensureQueryData(tasksQueryOptions(slug)),
			queryClient.ensureQueryData(expensesQueryOptions(slug)),
			queryClient.ensureQueryData(categoriesQueryOptions(slug)),
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
