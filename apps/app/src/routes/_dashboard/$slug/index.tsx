import { ContentCard } from "@/components/cards";
import { CreateExpenseDialogTrigger } from "@/components/expense";
import { ExpensesStats } from "@/components/expenses-stats";
import { ExpensesTable } from "@/components/expenses-table";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { UserAvatar } from "@/components/user-avatar";
import { CreateWalletDialogTrigger } from "@/components/wallet";
import { WalletIcon } from "@/components/wallet-icon";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { expensesQueryOptions, walletsQueryOptions } from "@/services/query-options";
import { ArrowRight, PlusIcon, SendHorizonalIcon, SquarePenIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Shortcuts</SectionTitle>
				</SectionHeader>
				<SectionContent columns={6}>
					<CreateExpenseDialogTrigger>
						<Button
							className={cn(
								"border-indigo-800 bg-indigo-800 text-indigo-50 hover:bg-indigo-900",
								"dark:border-transparent dark:bg-gradient-to-b dark:bg-transparent dark:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)]",
								"dark:from-indigo-600/45 dark:to-indigo-600/30 dark:text-indigo-100",
							)}
						>
							<SendHorizonalIcon className="mr-2 size-4" />
							Create expense
						</Button>
					</CreateExpenseDialogTrigger>
					<Button disabled>
						<SquarePenIcon className="mr-2 size-4" />
						Create task
					</Button>
				</SectionContent>
			</Section>

			<Section>
				<SectionContent columns={12}>
					<Section className="col-span-8">
						<SectionHeader>
							<SectionTitle>Overview</SectionTitle>
						</SectionHeader>
						<SectionContent>
							<ExpensesStats />
						</SectionContent>
					</Section>
					<Section className="col-span-4">
						<SectionHeader>
							<SectionTitle>Wallets</SectionTitle>
							<CreateWalletDialogTrigger>
								<Button variant="outline" size="sm">
									<PlusIcon className="mr-2 size-4" />
									Create
								</Button>
							</CreateWalletDialogTrigger>
							<HotKeyWithTooltip shortcut={KEYBOARD_SHORTCUTS.goto_library.label}>
								<Button variant="outline" size="sm" asChild>
									<Link to="/$slug/settings/library" params={{ slug }}>
										View all
										<ArrowRight className="ml-2 size-4" />
									</Link>
								</Button>
							</HotKeyWithTooltip>
						</SectionHeader>
						<SectionContent className="gap-4">
							{wallets.slice(0, 4).map((wallet) => (
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
										<div className="flex items-center gap-1.5">
											<UserAvatar
												className="size-4"
												name={wallet.owner.name}
												image={wallet.owner.image}
											/>
											<p className="text-muted-foreground text-xs leading-0">{wallet.owner.name}</p>
										</div>
									}
								/>
							))}
						</SectionContent>
					</Section>
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Recent entries</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<ExpensesTable data={expenses} actionable={false} />
				</SectionContent>
			</Section>
		</>
	);
}
