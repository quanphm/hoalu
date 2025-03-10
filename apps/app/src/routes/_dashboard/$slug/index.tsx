import { ContentCard } from "@/components/cards";
import { CreateExpenseDialogTrigger } from "@/components/expense";
import { ExpensesStats } from "@/components/expenses-stats";
import { ExpensesTable } from "@/components/expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { Stats } from "@/components/stats";
import { UserAvatar } from "@/components/user-avatar";
import { WalletIcon } from "@/components/wallet-icon";
import { expensesQueryOptions, walletsQueryOptions } from "@/services/query-options";
import { PlusIcon, SendIcon, SquarePenIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const wallets = useSuspenseQuery(walletsQueryOptions(params.slug));
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(params.slug));

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Shortcuts</SectionTitle>
				</SectionHeader>
				<SectionContent columns={6}>
					<CreateExpenseDialogTrigger>
						<Button className="bg-indigo-700 text-white/98 hover:bg-indigo-600/75">
							<SendIcon className="mr-2 size-4" />
							Create expense
						</Button>
					</CreateExpenseDialogTrigger>
					<Button>
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
							<SectionTitle>Wallets ({wallets.data.length})</SectionTitle>
							<Button variant="outline" size="sm">
								<PlusIcon className="mr-2 size-4" />
								Create wallet
							</Button>
						</SectionHeader>
						<SectionContent className="gap-4">
							{wallets.data.map((wallet) => (
								<ContentCard
									key={wallet.id}
									title={
										<p className="flex items-center gap-1.5">
											<WalletIcon type={wallet.type} />
											{wallet.name}
										</p>
									}
									description={wallet.description}
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

			<Section>
				<SectionHeader>
					<SectionTitle>Statistics</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12}>
					<Stats />
				</SectionContent>
			</Section>
		</>
	);
}
