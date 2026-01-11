import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTab } from "@hoalu/ui/tabs";

import { CreateCategoryDialogTrigger } from "#app/components/categories/category-actions.tsx";
import { CategoryTable } from "#app/components/categories/category-table.tsx";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import {
	Section,
	SectionAction,
	SectionContent,
	SectionDescription,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";
import { WalletTable } from "#app/components/wallets/wallet-table.tsx";
import { walletsQueryOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/library")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(walletsQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const categories = useLiveQueryCategories();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const [activeTab, setActiveTab] = useState("categories");

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Library</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="mb-6">
						<TabsTab value="categories">Categories</TabsTab>
						<TabsTab value="wallets">Wallets</TabsTab>
					</TabsList>
					<TabsContent value="categories">
						<Section>
							<SectionHeader>
								<SectionTitle className="text-lg">Categories</SectionTitle>
								<SectionDescription>
									Organize your expenses with custom categories and color codes
								</SectionDescription>
								<SectionAction>
									<CreateCategoryDialogTrigger />
								</SectionAction>
							</SectionHeader>
							<SectionContent columns={12}>
								<CategoryTable data={categories} />
							</SectionContent>
						</Section>
					</TabsContent>
					<TabsContent value="wallets">
						<Section>
							<SectionHeader>
								<SectionTitle className="text-lg">Wallets</SectionTitle>
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
					</TabsContent>
				</Tabs>
			</SectionContent>
		</Section>
	);
}
