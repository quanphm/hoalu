import { createFileRoute } from "@tanstack/react-router";

import { SendHorizonalIcon, WalletMinimalIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { CreateExpenseDialogTrigger } from "@/components/expense";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { CreateWalletDialogTrigger } from "@/components/wallet";

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
					<CreateExpenseDialogTrigger>
						<Button>
							<SendHorizonalIcon className="mr-2 size-4" />
							Create expense
						</Button>
					</CreateExpenseDialogTrigger>
					<CreateWalletDialogTrigger>
						<Button>
							<WalletMinimalIcon className="mr-2 size-4" />
							Create wallet
						</Button>
					</CreateWalletDialogTrigger>
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
