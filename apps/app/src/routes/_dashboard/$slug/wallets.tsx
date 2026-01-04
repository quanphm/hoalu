import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";
import { WalletTable } from "#app/components/wallets/wallet-table.tsx";
import { walletsQueryOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/wallets")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(walletsQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Wallets</SectionTitle>
				<CreateWalletDialogTrigger />
			</SectionHeader>
			<SectionContent>
				<WalletTable data={wallets} />
			</SectionContent>
		</Section>
	);
}
