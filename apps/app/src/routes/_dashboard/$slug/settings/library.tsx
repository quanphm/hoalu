import { ContentCard } from "@/components/cards";
import { CategoriesTable } from "@/components/categories-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { UserAvatar } from "@/components/user-avatar";
import {
	CreateWalletDialogTrigger,
	WalletDropdownMenuWithModal,
	WalletIcon,
} from "@/components/wallet";
import { categoriesQueryOptions, walletsQueryOptions } from "@/services/query-options";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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
				<SectionContent columns={3}>
					{wallets.map((wallet) => (
						<ContentCard
							key={wallet.id}
							className="flex flex-col justify-between"
							title={
								<div className="relative leading-relaxed">
									<p className="flex items-center gap-1.5">
										<WalletIcon type={wallet.type} /> {wallet.name}
									</p>
									<span className="font-normal text-muted-foreground text-sm">
										{wallet.description}
									</span>
								</div>
							}
							content={
								<>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5">
											<UserAvatar
												className="size-4"
												name={wallet.owner.name}
												image={wallet.owner.image}
											/>
											<p className="text-muted-foreground text-xs leading-0">{wallet.owner.name}</p>
										</div>
										<Badge
											variant="outline"
											className="pointer-events-non select-none gap-1.5 rounded-full bg-card"
										>
											{wallet.isActive ? (
												<>
													<span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
													In use
												</>
											) : (
												<>
													<span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
													Unused
												</>
											)}
										</Badge>
									</div>
									<div className="absolute top-3 right-4">
										<WalletDropdownMenuWithModal id={wallet.id} />
									</div>
								</>
							}
						/>
					))}
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Categories</SectionTitle>
					<Button variant="outline" size="sm">
						<PlusIcon className="mr-2 size-4" />
						Create category
					</Button>
				</SectionHeader>
				<SectionContent columns={12}>
					<div className="sm:col-span-8">
						<CategoriesTable data={categories} />
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
