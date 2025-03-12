import { ContentCard } from "@/components/cards";
import { CategoriesTable } from "@/components/categories-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { UserAvatar } from "@/components/user-avatar";
import { CreateWalletDialogTrigger } from "@/components/wallet";
import { WalletIcon } from "@/components/wallet-icon";
import { categoriesQueryOptions, walletsQueryOptions } from "@/services/query-options";
import { MoreHorizontalIcon, PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
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
				<SectionContent columns={4}>
					{wallets.map((wallet) => (
						<ContentCard
							key={wallet.id}
							title={
								<div className="leading-relaxed">
									<p className="flex items-center gap-1.5">
										<WalletIcon type={wallet.type} /> {wallet.name}
									</p>
									<span className="font-normal text-muted-foreground text-xs">
										{wallet.description}
									</span>
								</div>
							}
							content={
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1.5">
										<UserAvatar
											className="size-4"
											name={wallet.owner.name}
											image={wallet.owner.image}
										/>
										<p className="text-muted-foreground text-xs leading-0">{wallet.owner.name}</p>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<span className="sr-only">Open menu</span>
												<MoreHorizontalIcon className="size-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>Edit</DropdownMenuItem>
											<DropdownMenuItem>
												<span className="text-destructive">Delete</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
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
				<SectionContent>
					<div className="sm:col-span-3">
						<CategoriesTable data={categories} />
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
