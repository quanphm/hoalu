import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { WalletCard } from "@/components/cards";
import { CategoriesTable } from "@/components/categories-table";
import { CreateCategoryDialogTrigger } from "@/components/category-actions";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";
import {
	CreateWalletDialogTrigger,
	WalletDropdownMenuWithModal,
} from "@/components/wallet-actions";
import { categoriesQueryOptions, walletsQueryOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/$slug/settings/library")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Wallets</SectionTitle>
					<CreateWalletDialogTrigger>
						<Button variant="outline" size="sm">
							<PlusIcon className="mr-2 size-4" />
							Create wallet
						</Button>
					</CreateWalletDialogTrigger>
				</SectionHeader>
				<SectionContent columns={4} className="gap-4">
					{wallets.map((w) => (
						<WalletCard key={w.id} {...w} actions={<WalletDropdownMenuWithModal id={w.id} />} />
					))}
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Categories</SectionTitle>
					<CreateCategoryDialogTrigger>
						<Button variant="outline" size="sm">
							<PlusIcon className="mr-2 size-4" />
							Create category
						</Button>
					</CreateCategoryDialogTrigger>
				</SectionHeader>
				<SectionContent columns={12}>
					<CategoriesTable data={categories} />
				</SectionContent>
			</Section>
		</>
	);
}
