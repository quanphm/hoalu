import { ContentCard } from "@/components/cards";
import { CategoriesTable } from "@/components/categories-table";
import { CreateCategoryDialogTrigger } from "@/components/category";
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
				<SectionContent columns={3} className="gap-4">
					{wallets.map((w) => (
						<ContentCard
							key={w.id}
							className="flex flex-col justify-between"
							title={
								<p className="flex items-center gap-1.5">
									<WalletIcon type={w.type} />
									{w.name}
								</p>
							}
							description={w.description}
							content={
								<>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5">
											<UserAvatar className="size-4" name={w.owner.name} image={w.owner.image} />
											<p className="text-muted-foreground text-xs leading-0">{w.owner.name}</p>
										</div>
										<Badge
											variant="outline"
											className="pointer-events-non select-none gap-1.5 rounded-full bg-card"
										>
											{w.isActive ? (
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
										<WalletDropdownMenuWithModal id={w.id} />
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
