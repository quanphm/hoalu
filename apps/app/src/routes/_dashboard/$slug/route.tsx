import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { toast } from "@hoalu/ui/sonner";
import { PageContent } from "@/components/layouts/page-content";
import { WorkspaceActionProvider } from "@/components/providers/workspace-action-provider";
import {
	categoriesQueryOptions,
	expensesQueryOptions,
	filesQueryOptions,
	getActiveMemberOptions,
	getWorkspaceDetailsOptions,
	tasksQueryOptions,
	walletsQueryOptions,
} from "@/services/query-options";

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
		toast.error(error.message);
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
