import { UpcomingBillsList } from "#app/components/upcoming-bills/upcoming-bills-list.tsx";
import { useUpcomingBills } from "#app/components/upcoming-bills/use-upcoming-bills.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";

export function UpcomingBillsWidget() {
	const upcomingBills = useUpcomingBills();

	return (
		<Card className="flex h-full max-h-[500px] min-h-[300px] flex-col">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					<span>Upcoming Bills</span>
					{upcomingBills.length > 0 && (
						<span className="bg-primary/20 text-primary rounded-md px-2 py-0.5 text-xs font-normal">
							{upcomingBills.length} scheduled
						</span>
					)}
				</CardTitle>
				<CardDescription>Next 30 days · Yearly bills within 1 year</CardDescription>
			</CardHeader>
			<CardContent className="min-h-0 flex-1 overflow-y-auto">
				<UpcomingBillsList bills={upcomingBills} />
			</CardContent>
		</Card>
	);
}
