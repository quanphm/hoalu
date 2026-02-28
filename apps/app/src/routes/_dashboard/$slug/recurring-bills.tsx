import { RecurringBillDetails } from "#app/components/recurring-bills/recurring-bill-details.tsx";
import { RecurringBillList } from "#app/components/recurring-bills/recurring-bill-list.tsx";
import { useLiveQueryRecurringBills } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { createRecurringBillDialogAtom } from "#app/atoms/index.ts";
import {
	Section,
	SectionAction,
	SectionContent,
	SectionHeader,
	SectionItem,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

export const Route = createFileRoute("/_dashboard/$slug/recurring-bills")({
	component: RouteComponent,
});

function RouteComponent() {
	const bills = useLiveQueryRecurringBills();
	const setCreateDialog = useSetAtom(createRecurringBillDialogAtom);

	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Recurring Bills</SectionTitle>
				<SectionAction>
					<Button variant="outline" onClick={() => setCreateDialog({ state: true })}>
						Create bill
					</Button>
				</SectionAction>
			</SectionHeader>

			<SectionContent
				columns={12}
				className="h-[calc(100vh-84px-70px)] gap-0 overflow-hidden max-md:h-[calc(100vh-84px-70px)]"
			>
				<SectionItem
					data-slot="recurring-bill-list"
					desktopSpan="col-span-6"
					tabletSpan={1}
					mobileOrder={1}
				>
					<RecurringBillList bills={bills} />
				</SectionItem>

				<SectionItem
					data-slot="recurring-bill-details"
					desktopSpan="col-span-6"
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
