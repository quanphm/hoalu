import { createFileRoute } from "@tanstack/react-router";

import { ExpenseDashboardChart } from "@/components/charts/expenses-dashboard-chart";
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
					<Section>
						<SectionContent columns={12}>
							<div data-slot="expense-filter" className="col-span-8">
								<ExpenseDashboardChart />
							</div>
							<div data-slot="expense-filter" className="col-span-4"></div>
						</SectionContent>
					</Section>
				</SectionContent>
			</Section>
		</>
	);
}
