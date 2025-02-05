import { PageContent } from "@/components/layouts/page-content";
import { getActiveMemberOptions, getWorkspaceDetailsOptions } from "@/services/query-options";
import { toast } from "@hoalu/ui/sonner";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		const result = await Promise.all([
			queryClient.ensureQueryData(getWorkspaceDetailsOptions(slug)),
			queryClient.ensureQueryData(getActiveMemberOptions(slug)),
		]);

		return {
			workspace: result[0],
			activeMember: result[1],
		};
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
