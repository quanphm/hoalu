import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { useValue } from "@legendapp/state/react";

import { redactedAmount$ } from "#app/atoms/redacted.ts";
import { UpcomingBillsList } from "#app/components/upcoming-bills/upcoming-bills-list.tsx";
import { useBillingProjection } from "#app/components/upcoming-bills/use-billing-projection.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { REDACTED_AMOUNT } from "#app/helpers/redacted.ts";

const DUE_SOON_DAYS = 30;

export function UpcomingBillsWidget() {
	const { overdue, today, upcoming, unsupported } = useBillingProjection();
	const isRedacted = useValue(redactedAmount$);

	const bills = [...overdue, ...today, ...upcoming];
	const dueSoon = bills.filter((bill) => bill.daysUntil <= DUE_SOON_DAYS);
	const later = bills.length - dueSoon.length;

	const currencies = new Set(dueSoon.map((bill) => bill.currency));
	const singleCurrency = currencies.size === 1 ? (dueSoon[0]?.currency ?? null) : null;
	const dueSoonTotal = dueSoon.reduce((sum, bill) => sum + bill.amount, 0);

	const summary = [
		dueSoon.length > 0 ? `${dueSoon.length} due in ${DUE_SOON_DAYS} days` : null,
		singleCurrency
			? isRedacted
				? REDACTED_AMOUNT
				: formatCurrency(dueSoonTotal, singleCurrency)
			: null,
		later > 0 ? `+${later} later` : null,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<Card className="flex h-full flex-col">
			<CardHeader>
				<CardTitle className="text-base">Upcoming bills</CardTitle>
				<CardDescription>{summary || "Nothing scheduled"}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col px-0">
				{unsupported.length > 0 && (
					<p className="text-muted-foreground px-4 pb-2 text-xs">
						{unsupported.length} bill{unsupported.length !== 1 ? "s" : ""} can&apos;t be scheduled
						yet.
					</p>
				)}
				<UpcomingBillsList overdue={overdue} today={today} upcoming={upcoming} />
			</CardContent>
		</Card>
	);
}
