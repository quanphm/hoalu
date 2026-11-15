import { Button } from "@hoalu/ui/button";
import { Tabs, TabsList, TabsTab } from "@hoalu/ui/tabs";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useMatches, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import WalletList, { type WalletStatusFilter } from "#app/components/wallets/wallet-list.tsx";
import { walletsQueryOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/wallets")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(walletsQueryOptions(slug));
	},
	component: LayoutComponent,
});

function LayoutComponent() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const matches = useMatches();
	const editing = matches.some((m) => m.routeId === "/_dashboard/$slug/wallets/$walletId");
	const creating = matches.some((m) => m.routeId === "/_dashboard/$slug/wallets/new");
	const [statusFilter, setStatusFilter] = useState<WalletStatusFilter>("all");
	const listScrollRef = useRef(0);

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Wallets</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<Button
						size="sm"
						disabled={creating}
						render={<Link to="/$slug/wallets/new" params={{ slug }} />}
					>
						Create wallet
					</Button>
				</ToolbarActions>
			</Toolbar>

			<PageContent fill={!editing && !creating}>
				<Section className={cn("gap-0", !editing && !creating && "max-md:min-h-0 max-md:flex-1")}>
					{editing || creating ? (
						<Outlet />
					) : (
						<>
							<div className="flex items-center justify-start border-b px-4 py-2">
								<Tabs
									value={statusFilter}
									onValueChange={(value) => setStatusFilter(value as WalletStatusFilter)}
								>
									<TabsList aria-label="Filter wallets by status">
										<TabsTab value="all" className="sm:h-6">
											All
										</TabsTab>
										<TabsTab value="active" className="sm:h-6">
											In use
										</TabsTab>
										<TabsTab value="inactive" className="sm:h-6">
											Retired
										</TabsTab>
									</TabsList>
								</Tabs>
							</div>
							<SectionContent
								columns={12}
								className="grid-cols-1 overflow-hidden max-md:min-h-0 max-md:flex-1 max-md:grid-rows-1 md:h-[calc(100dvh-(--spacing(24)))] md:gap-0"
							>
								<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
									<WalletList
										wallets={wallets}
										statusFilter={statusFilter}
										scrollRef={listScrollRef}
									/>
								</SectionItem>
							</SectionContent>
						</>
					)}
				</Section>
			</PageContent>
		</>
	);
}
