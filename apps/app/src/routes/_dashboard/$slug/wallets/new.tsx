import { createFileRoute } from "@tanstack/react-router";

import { CreateWalletPage } from "#app/components/wallets/wallet-create.tsx";

export const Route = createFileRoute("/_dashboard/$slug/wallets/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateWalletPage />;
}
