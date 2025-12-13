import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { toastManager } from "@hoalu/ui/toast";

import { PageContent } from "#app/components/layouts/page-content.tsx";
import { WorkspaceActionProvider } from "#app/components/providers/workspace-action-provider.tsx";
import { categoryCollection } from "#app/lib/collections/category.ts";
import { exchangeRateCollection } from "#app/lib/collections/exchange-rate.ts";
import { expenseCollection } from "#app/lib/collections/expense.ts";
import { walletCollection } from "#app/lib/collections/wallet.ts";
import { getWorkspaceDetailsOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await Promise.all([
			queryClient.ensureQueryData(getWorkspaceDetailsOptions(slug)),
			expenseCollection(slug).preload(),
			categoryCollection(slug).preload(),
			walletCollection(slug).preload(),
			exchangeRateCollection.preload(),
		]);
	},
	onError: (error) => {
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
			<PageContent>
				<Outlet />
			</PageContent>
		</WorkspaceActionProvider>
	);
}
