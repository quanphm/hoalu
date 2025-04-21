import { PageContent } from "@/components/layouts/page-content";
import {
	categoriesQueryOptions,
	expensesQueryOptions,
	filesQueryOptions,
	getActiveMemberOptions,
	getWorkspaceDetailsOptions,
	tasksQueryOptions,
	walletsQueryOptions,
} from "@/services/query-options";
import { toast } from "@hoalu/ui/sonner";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
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
		<PageContent>
			<Outlet />
		</PageContent>
	);
}
