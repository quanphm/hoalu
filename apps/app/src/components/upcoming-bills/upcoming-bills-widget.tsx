import { Badge } from "@hoalu/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
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
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Upcoming Bills <Badge variant="info">{totalCount}</Badge>
				</CardTitle>
				<CardDescription>Next 30 days, yearly and overdue bills</CardDescription>
			</CardHeader>
			<CardContent className="max-h-90 px-0">
				<UpcomingBillsList
					overdue={data?.overdue ?? []}
					today={data?.today ?? []}
					upcoming={data?.upcoming ?? []}
				/>
			</CardContent>
		</Card>
	);
}
