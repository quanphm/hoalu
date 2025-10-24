import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { WalletCard } from "#app/components/cards.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import {
	CreateWalletDialogTrigger,
	WalletDropdownMenuWithModal,
} from "#app/components/wallets/wallet-actions.tsx";
import { walletsQueryOptions } from "#app/services/query-options.ts";

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
