import { UpcomingBillsList } from "#app/components/upcoming-bills/upcoming-bills-list.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { unifiedBillsQueryOptions } from "#app/services/query-options.ts";
import { Card, CardContent, CardDescription, CardHeader } from "@hoalu/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";

export function UpcomingBillsWidget() {
	const workspace = useWorkspace();
	const { data } = useSuspenseQuery(unifiedBillsQueryOptions(workspace.slug));

	const totalCount = data.overdue.length + data.today.length + data.upcoming.length;

	return (
		<Card className="flex h-full max-h-[500px] min-h-[300px] flex-col">
			<CardHeader className="pb-3">
				<CardDescription className="flex items-center justify-between text-xs uppercase">
					Upcoming Bills
				</CardDescription>
				{totalCount > 0 && (
					<CardDescription>
						<span className="text-primary-foreground text-3xl font-semibold">{totalCount}</span>
					</CardDescription>
				)}
				<CardDescription>Overdue, today, next 30 days and yearly bills</CardDescription>
			</CardHeader>
			<CardContent className="min-h-0 flex-1 overflow-y-auto">
				<UpcomingBillsList overdue={data.overdue} today={data.today} upcoming={data.upcoming} />
			</CardContent>
		</Card>
	);
}
