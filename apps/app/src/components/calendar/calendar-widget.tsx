import { UpcomingBillsList } from "#app/components/calendar/upcoming-bills-list.tsx";
import { useCalendar } from "#app/components/calendar/use-calendar.ts";
import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";

interface CalendarWidgetProps {
	expenses: SyncedExpense[];
}

export function CalendarWidget({ expenses }: CalendarWidgetProps) {
	const { upcomingBills } = useCalendar(expenses);
	const upcomingCount = upcomingBills.length;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle>Upcoming Bills</CardTitle>
				<CardDescription>Predicted from last month · Next 30 days</CardDescription>
				<CardAction>
					{upcomingCount > 0 && (
						<span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
							{upcomingCount} scheduled
						</span>
					)}
				</CardAction>
			</CardHeader>
			<CardContent>
				<UpcomingBillsList bills={upcomingBills} />
			</CardContent>
		</Card>
	);
}
