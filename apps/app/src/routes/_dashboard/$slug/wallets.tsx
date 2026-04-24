import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";
import { WalletTable } from "#app/components/wallets/wallet-table.tsx";
import { walletsQueryOptions } from "#app/services/query-options.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/wallets")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(walletsQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Wallets</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<CreateWalletDialogTrigger />
				</ToolbarActions>
			</Toolbar>

			<PageContent>
				<Section>
					<SectionContent>
						<WalletTable data={wallets} />
					</SectionContent>
				</Section>
			</PageContent>
		</>
	);
}
