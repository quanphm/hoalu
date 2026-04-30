import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { CreateRecurringBillDialogTrigger } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import RecurringBillList, {
	type RecurringBillStatusFilter,
} from "#app/components/recurring-bills/recurring-bill-list.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { Tabs, TabsList, TabsTab } from "@hoalu/ui/tabs";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/$slug/recurring-bills")({
	component: LayoutComponent,
});

function LayoutComponent() {
	const matches = useMatches();
	const billMatch = matches.find((m) => m.routeId === "/_dashboard/$slug/recurring-bills/$billId");
	const billId = billMatch ? (billMatch.params as Record<string, string>).billId : undefined;
	const [statusFilter, setStatusFilter] = useState<RecurringBillStatusFilter>("active");

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Recurring Bills</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<CreateRecurringBillDialogTrigger />
					<ToolbarSeparator />
					<RedactedAmountToggle />
				</ToolbarActions>
			</Toolbar>

			<PageContent>
				<Section className="gap-0">
					{billId ? (
						<Outlet />
					) : (
						<>
							<div className="flex items-center justify-end border-b px-4 py-2">
								<Tabs
									value={statusFilter}
									onValueChange={(v) => setStatusFilter(v as RecurringBillStatusFilter)}
								>
									<TabsList>
										<TabsTab value="all" className="sm:h-6">
											All
										</TabsTab>
										<TabsTab value="active" className="sm:h-6">
											Active
										</TabsTab>
										<TabsTab value="archived" className="sm:h-6">
											Archived
										</TabsTab>
									</TabsList>
								</Tabs>
							</div>
							<SectionContent
								columns={12}
								className="h-[calc(100vh-(--spacing(24)))] grid-cols-1 overflow-hidden md:gap-0"
							>
								<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
									<RecurringBillList statusFilter={statusFilter} />
								</SectionItem>
							</SectionContent>
						</>
					)}
				</Section>
			</PageContent>
		</>
	);
}
