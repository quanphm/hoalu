import { createFileRoute } from "@tanstack/react-router";

import { CashFlowChart } from "#app/components/charts/cash-flow-chart.tsx";
import { CashFlowSection } from "#app/components/charts/cash-flow.tsx";
import { CategoryBreakdown } from "#app/components/charts/category-breakdown.tsx";
import { ExpenseOverview } from "#app/components/charts/expenses-overview.tsx";
import { useDashboardModel } from "#app/components/charts/use-dashboard-model.ts";
import { SectionContent } from "#app/components/layouts/section.tsx";
import { UpcomingBillsWidget } from "#app/components/upcoming-bills/upcoming-bills-widget.tsx";

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue/")({
	component: RouteComponent,
});

function RouteComponent() {
	const model = useDashboardModel();

	return (
		<SectionContent columns={24} className="items-start gap-4 p-4">
			<div className="col-span-24 flex h-full flex-col gap-4 md:col-span-8">
				<CashFlowChart model={model} />
			</div>
			<div className="col-span-24 flex flex-col gap-4 md:col-span-16">
				<ExpenseOverview model={model} categories={model.categories.list} />
				<CashFlowSection model={model} />
			</div>

			<div className="col-span-24 flex flex-col gap-4 md:col-span-16">
				<SectionContent columns={2}>
					<div className="col-span-1 flex h-full flex-col gap-4">
						<UpcomingBillsWidget />
					</div>
					<div className="col-span-1 flex h-full flex-col gap-4">
						<CategoryBreakdown model={model} />
					</div>
				</SectionContent>
			</div>
			<div className="col-span-24 flex flex-col gap-4 md:col-span-8"></div>
		</SectionContent>
	);
}
