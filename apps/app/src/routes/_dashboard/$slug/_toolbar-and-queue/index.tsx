import { createFileRoute } from "@tanstack/react-router";

import { CashFlowTiles } from "#app/components/charts/cash-flow-tiles.tsx";
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
		<SectionContent columns={24} className="items-stretch gap-4 p-4">
			<div className="col-span-2 min-w-0 sm:col-span-3 md:col-span-4 lg:col-span-24">
				<CashFlowTiles model={model} />
			</div>
			<div className="col-span-2 min-w-0 sm:col-span-3 md:col-span-4 lg:col-span-16">
				<ExpenseOverview model={model} categories={model.categories.list} />
			</div>
			<div className="col-span-2 min-w-0 sm:col-span-3 md:col-span-4 lg:col-span-8">
				<UpcomingBillsWidget />
			</div>
			<div className="col-span-2 min-w-0 sm:col-span-3 md:col-span-4 lg:col-span-24">
				<CategoryBreakdown model={model} />
			</div>
		</SectionContent>
	);
}
