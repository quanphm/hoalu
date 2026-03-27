import { type SyncedEvent, useSelectedEvent } from "#app/components/events/use-events.ts";
import { cn } from "@hoalu/ui/utils";

interface EventListProps {
	events: SyncedEvent[];
}

export function EventList({ events }: EventListProps) {
	const { event: selected, onSelectEvent } = useSelectedEvent();

	if (!events.length) {
		return (
			<div className="text-muted-foreground flex h-full items-center justify-center text-sm">
				No events yet. Create one to start grouping expenses.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1">
			{events.map((e) => (
				<EventListItem
					key={e.id}
					event={e}
					isSelected={selected.id === e.id}
					onSelect={() => onSelectEvent(e.id)}
				/>
			))}
		</div>
	);
}

function EventListItem({
	event,
	isSelected,
	onSelect,
}: {
	event: SyncedEvent;
	isSelected: boolean;
	onSelect: () => void;
}) {
	const progress =
		event.realBudget && event.realBudget > 0
			? Math.min((event.totalSpent / event.realBudget) * 100, 100)
			: null;

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"hover:bg-muted/50 flex w-full flex-col gap-1.5 rounded-md px-3 py-2.5 text-left transition-colors",
				isSelected && "bg-muted",
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="truncate text-sm font-medium">{event.title}</span>
				<span
					className={cn(
						"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
						event.status === "open"
							? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
					)}
				>
					{event.status}
				</span>
			</div>

			{(event.start_date || event.end_date) && (
				<span className="text-muted-foreground text-xs">
					{event.start_date ?? "?"} – {event.end_date ?? "ongoing"}
				</span>
			)}

			<div className="flex items-center justify-between gap-2 text-xs">
				<span>
					{event.budget_currency} {event.totalSpent.toFixed(2)} spent
				</span>
				{event.realBudget != null && (
					<span className="text-muted-foreground">
						/ {event.budget_currency} {event.realBudget.toFixed(2)}
					</span>
				)}
			</div>

			{progress != null && (
				<div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
					<div
						className={cn(
							"h-full rounded-full transition-all",
							progress >= 100 ? "bg-destructive" : progress >= 80 ? "bg-orange-400" : "bg-primary",
						)}
						style={{ width: `${progress}%` }}
					/>
				</div>
			)}
		</button>
	);
}
