import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowRight, SendHorizonalIcon, WalletMinimalIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { CreateExpenseDialogTrigger } from "@/components/expense";
import { ExpensesStats } from "@/components/expenses-stats";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { RecentExpensesTable } from "@/components/recent-expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { CreateWalletDialogTrigger } from "@/components/wallet";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { expensesQueryOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));
	const recentTransactions = expenses.slice(0, 7);

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Shortcuts</SectionTitle>
				</SectionHeader>
				<SectionContent columns={6} className="gap-4">
					<CreateExpenseDialogTrigger>
						<Button
							className={cn(
								"border-blue-800 bg-blue-800 text-blue-50 hover:bg-blue-800/90",
								"dark:border-transparent dark:bg-gradient-to-b dark:bg-transparent dark:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)]",
								"dark:from-blue-600/45 dark:to-blue-600/30 dark:text-blue-100",
							)}
						>
							<SendHorizonalIcon className="mr-2 size-4" />
							Create expense
						</Button>
					</CreateExpenseDialogTrigger>
					<CreateWalletDialogTrigger>
						<Button
							className={cn(
								"border-purple-800 bg-purple-800 text-purple-50 hover:bg-purple-800/90",
								"dark:border-transparent dark:bg-gradient-to-b dark:bg-transparent dark:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)]",
								"dark:from-purple-600/45 dark:to-purple-600/30 dark:text-purple-100",
							)}
						>
							<WalletMinimalIcon className="mr-2 size-4" />
							Create wallet
						</Button>
					</CreateWalletDialogTrigger>
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Overview</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12}>
					<Section className="col-span-6">
						<SectionContent>
							<ExpensesStats />
						</SectionContent>
					</Section>
					<Section className="col-span-6">
						<SectionContent>
							<ExpensesStats />
						</SectionContent>
					</Section>
				</SectionContent>
			</Section>

			<Section>
				<SectionContent columns={12}>
					<Section className="col-span-9">
						<SectionHeader>
							<SectionTitle>Recent entries</SectionTitle>
							<HotKeyWithTooltip shortcut={KEYBOARD_SHORTCUTS.goto_expenses}>
								<Button variant="outline" size="sm" asChild>
									<Link to="/$slug/expenses" params={{ slug }}>
										View all
										<ArrowRight className="ml-2 size-4" />
									</Link>
								</Button>
							</HotKeyWithTooltip>
						</SectionHeader>
						<SectionContent>
							<RecentExpensesTable data={recentTransactions} />
						</SectionContent>
					</Section>
				</SectionContent>
			</Section>
		</>
	);
}
