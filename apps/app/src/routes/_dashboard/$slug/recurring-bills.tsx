import {
	Section,
	SectionAction,
	SectionContent,
	SectionHeader,
	SectionItem,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { CreateRecurringBillDialogTrigger } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import { RecurringBillDetails } from "#app/components/recurring-bills/recurring-bill-details.tsx";
import RecurringBillList from "#app/components/recurring-bills/recurring-bill-list.tsx";
import { useSortedRecurringBills } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/recurring-bills")({
	component: RouteComponent,
});

function RouteComponent() {
	const bills = useSortedRecurringBills();

	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Recurring Bills</SectionTitle>
				<SectionAction>
					<CreateRecurringBillDialogTrigger />
				</SectionAction>
			</SectionHeader>

			<SectionContent
				columns={12}
				className="h-[calc(100vh-84px-14px)] gap-0 overflow-hidden max-md:h-[calc(100vh-84px-14px)] md:gap-0"
			>
				<SectionItem
					data-slot="recurring-bill-list"
					desktopSpan="col-span-5"
					tabletSpan={1}
					mobileOrder={1}
				>
					<RecurringBillList bills={bills} />
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
	);
}
