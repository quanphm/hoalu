import { Card, CardContent, CardDescription, CardHeader } from "@hoalu/ui/card";
import { useQuery } from "@tanstack/react-query";

import { UpcomingBillsList } from "#app/components/upcoming-bills/upcoming-bills-list.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { unifiedBillsQueryOptions } from "#app/services/query-options.ts";

export function UpcomingBillsWidget() {
	const workspace = useWorkspace();
	const { data } = useQuery(unifiedBillsQueryOptions(workspace.slug));

	const totalCount =
		(data?.overdue.length ?? 0) + (data?.today.length ?? 0) + (data?.upcoming.length ?? 0);

	return (
		<Card className="flex h-full max-h-125 min-h-75 flex-col">
			<CardHeader>
				<CardDescription className="flex items-center justify-between text-xs uppercase">
					Upcoming Bills
				</CardDescription>
				{totalCount > 0 && (
					<CardDescription>
						<span className="text-foreground text-xl font-semibold">{totalCount}</span>
					</CardDescription>
				)}
				<CardDescription>Next 30 days, yearly and overdue bills</CardDescription>
			</CardHeader>
			<CardContent className="min-h-0 flex-1 overflow-y-auto">
				<UpcomingBillsList
					overdue={data?.overdue ?? []}
					today={data?.today ?? []}
					upcoming={data?.upcoming ?? []}
				/>
			</CardContent>
		</Card>
	);
}
