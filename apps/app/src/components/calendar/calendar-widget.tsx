import { UpcomingBillsList } from "#app/components/calendar/upcoming-bills-list.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { upcomingBillsQueryOptions } from "#app/services/query-options.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";

export function CalendarWidget() {
	const workspace = useWorkspace();
	const { data: upcomingBills } = useSuspenseQuery(upcomingBillsQueryOptions(workspace.slug));

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					Upcoming Bills{" "}
					{upcomingBills.length > 0 && (
						<span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-normal">
							{upcomingBills.length} scheduled
						</span>
					)}
				</CardTitle>
				<CardDescription>Next 30 days · Yearly bills within 1 year</CardDescription>
			</CardHeader>
			<CardContent>
				<UpcomingBillsList bills={upcomingBills} />
			</CardContent>
		</Card>
	);
}
