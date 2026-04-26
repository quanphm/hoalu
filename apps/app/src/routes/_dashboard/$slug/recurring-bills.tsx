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
import { RecurringBillDetails } from "#app/components/recurring-bills/recurring-bill-details.tsx";
import RecurringBillList from "#app/components/recurring-bills/recurring-bill-list.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/recurring-bills")({
	component: RouteComponent,
});

function RouteComponent() {
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
				<Section>
					<SectionContent
						columns={12}
						className="h-[calc(100vh-94px)] gap-0 overflow-hidden max-md:h-[calc(100vh-94px)] md:gap-0"
					>
						<SectionItem
							data-slot="recurring-bill-list"
							desktopSpan="col-span-5"
							tabletSpan={1}
							mobileOrder={1}
						>
							<RecurringBillList />
						</SectionItem>

						<SectionItem
							data-slot="recurring-bill-details"
							desktopSpan="col-span-7"
							tabletSpan={1}
							mobileOrder={2}
							hideOnMobile
						>
							<RecurringBillDetails />
						</SectionItem>
					</SectionContent>
				</Section>
			</PageContent>
		</>
	);
}
