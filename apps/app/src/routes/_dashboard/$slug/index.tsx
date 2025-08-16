import { createFileRoute } from "@tanstack/react-router";

import { CreateExpenseDialogTrigger } from "@/components/expenses/expense-actions";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";
import { CreateWalletDialogTrigger } from "@/components/wallets/wallet-actions";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Shortcuts</SectionTitle>
				</SectionHeader>
				<SectionContent columns={6} className="gap-4">
					<CreateExpenseDialogTrigger />
					<CreateWalletDialogTrigger />
				</SectionContent>
			</Section>

			<Section>
				<SectionContent>
					{/* <Section>
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
					</Section> */}
				</SectionContent>
			</Section>
		</>
	);
}
