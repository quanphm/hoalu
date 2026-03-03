import { UnifiedBillsList } from "#app/components/upcoming-bills/upcoming-bills-list.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { unifiedBillsQueryOptions } from "#app/services/query-options.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";

export function UpcomingBillsWidget() {
	const workspace = useWorkspace();
	const { data } = useSuspenseQuery(unifiedBillsQueryOptions(workspace.slug));

	const totalCount = data.overdue.length + data.today.length + data.upcoming.length;

	return (
		<Card className="flex h-full max-h-[500px] min-h-[300px] flex-col">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					<span>Upcoming Bills</span>
					{totalCount > 0 && (
						<span className="bg-primary/20 text-primary rounded-md px-2 py-0.5 text-xs font-normal">
							{totalCount} scheduled
						</span>
					)}
				</CardTitle>
				<CardDescription>Overdue, today, next 30 days and annually bills</CardDescription>
			</CardHeader>
			<CardContent className="min-h-0 flex-1 overflow-y-auto">
				<UnifiedBillsList overdue={data.overdue} today={data.today} upcoming={data.upcoming} />
			</CardContent>
		</Card>
	);
}
