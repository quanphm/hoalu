import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";

import { UpcomingBillsList } from "#app/components/upcoming-bills/upcoming-bills-list.tsx";
import { useBillingProjection } from "#app/components/upcoming-bills/use-billing-projection.ts";

export function UpcomingBillsWidget() {
	const { overdue, today, upcoming, anomalies } = useBillingProjection();

	const totalCount = overdue.length + today.length + upcoming.length;
	const anomalyCount = anomalies.length;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">Upcoming Bills</CardTitle>
				<CardDescription>
					{totalCount} bill{totalCount !== 1 ? "s" : ""} in the next 30 days
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-90 px-0">
				{anomalyCount > 0 && (
					<p className="text-muted-foreground px-4 pb-2 text-xs">
						{anomalyCount} payment{anomalyCount !== 1 ? "s" : ""}
						{anomalyCount !== 1 ? " don't" : " doesn't"} match any bill schedule.
					</p>
				)}
				<UpcomingBillsList overdue={overdue} today={today} upcoming={upcoming} />
			</CardContent>
		</Card>
	);
}
