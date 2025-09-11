import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { WalletCard } from "@/components/cards";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";
import {
	CreateWalletDialogTrigger,
	WalletDropdownMenuWithModal,
} from "@/components/wallets/wallet-actions";
import { walletsQueryOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/$slug/wallets")({
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
			<SectionContent columns={4} className="gap-4">
				{wallets.map((w) => (
					<WalletCard key={w.id} {...w} actions={<WalletDropdownMenuWithModal id={w.id} />} />
				))}
			</SectionContent>
		</Section>
	);
}
