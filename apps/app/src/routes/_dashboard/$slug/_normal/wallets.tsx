import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";
import { WalletTable } from "#app/components/wallets/wallet-table.tsx";
import { walletsQueryOptions } from "#app/services/query-options.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
	Section,
	SectionAction,
	SectionContent,
	SectionDescription,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";

export const Route = createFileRoute("/_dashboard/$slug/_normal/wallets")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(walletsQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Wallets</SectionTitle>
				<SectionDescription>
					Manage your accounts, cards, and payment methods
				</SectionDescription>
				<SectionAction>
					<CreateWalletDialogTrigger />
				</SectionAction>
			</SectionHeader>
			<SectionContent>
				<WalletTable data={wallets} />
			</SectionContent>
		</Section>
	)
}
