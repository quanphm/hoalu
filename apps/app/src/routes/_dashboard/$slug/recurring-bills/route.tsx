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
import RecurringBillList from "#app/components/recurring-bills/recurring-bill-list.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/recurring-bills")({
	component: LayoutComponent,
});

function LayoutComponent() {
	const matches = useMatches();
	const billMatch = matches.find((m) => m.routeId === "/_dashboard/$slug/recurring-bills/$billId");
	const billId = billMatch ? (billMatch.params as Record<string, string>).billId : undefined;

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
						<SectionContent
							columns={12}
							className="h-[calc(100vh-49px)] grid-cols-1 overflow-hidden md:gap-0"
						>
							<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
								<RecurringBillList />
							</SectionItem>
						</SectionContent>
					)}
				</Section>
			</PageContent>
		</>
	);
}
