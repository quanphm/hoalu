import { ContentCard } from "@/components/cards";
import { CategoriesTable } from "@/components/categories-table";
import { CreateCategoryDialogTrigger } from "@/components/category";
import { ImageGallery } from "@/components/image-gallery";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { UserAvatar } from "@/components/user-avatar";
import {
	CreateWalletDialogTrigger,
	WalletDropdownMenuWithModal,
	WalletIcon,
} from "@/components/wallet";
import {
	categoriesQueryOptions,
	filesQueryOptions,
	walletsQueryOptions,
} from "@/services/query-options";
import { BoltIcon, ImagesIcon, PlusIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { ScrollArea, ScrollBar } from "@hoalu/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@hoalu/ui/tabs";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings/library")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: files } = useSuspenseQuery(filesQueryOptions(slug));

	return (
		<Tabs defaultValue="general">
			<ScrollArea>
				<TabsList className="mb-8 gap-2 bg-muted/50">
					<TabsTrigger
						value="general"
						className={cn(
							"rounded-md px-6 py-2 data-[state=active]:bg-muted data-[state=active]:text-foreground",
							"dark:data-[state=active]:bg-gradient-to-b dark:data-[state=active]:bg-sidebar-accent/45 dark:data-[state=active]:from-sidebar-primary dark:data-[state=active]:to-sidebar-primary/70 dark:data-[state=active]:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)]",
						)}
					>
						<BoltIcon className="mr-2 size-4" />
						General
					</TabsTrigger>
					<TabsTrigger
						value="photos"
						className={cn(
							"rounded-md px-6 py-2 data-[state=active]:bg-muted data-[state=active]:text-foreground",
							"dark:data-[state=active]:bg-gradient-to-b dark:data-[state=active]:bg-sidebar-accent/45 dark:data-[state=active]:from-sidebar-primary dark:data-[state=active]:to-sidebar-primary/70 dark:data-[state=active]:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)]",
						)}
					>
						<ImagesIcon className="mr-2 size-4" />
						Photos
					</TabsTrigger>
				</TabsList>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>

			<TabsContent value="general" className="flex flex-col gap-10">
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
														<span
															className="size-1.5 rounded-full bg-green-500"
															aria-hidden="true"
														/>
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
						<div className="sm:col-span-8">
							<CategoriesTable data={categories} />
						</div>
					</SectionContent>
				</Section>
			</TabsContent>

			<TabsContent value="photos">
				<Section>
					<SectionHeader>
						<SectionTitle>Uploaded</SectionTitle>
					</SectionHeader>
					<SectionContent>
						<ImageGallery data={files} />
					</SectionContent>
				</Section>
			</TabsContent>
		</Tabs>
	);
}
