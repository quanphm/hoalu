import { CurrencyValue } from "#app/components/currency-value.tsx";
import { EventDateRange } from "#app/components/events/event-date-range.tsx";
import { type SyncedEvent, useSelectedEvent } from "#app/components/events/use-events.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { Progress, ProgressIndicator, ProgressTrack } from "@hoalu/ui/progress";
import { cn } from "@hoalu/ui/utils";
import { memo, useMemo } from "react";

interface EventListProps {
	events: SyncedEvent[];
}

type EventGroup = {
	label: string;
	events: SyncedEvent[];
};

function groupEvents(events: SyncedEvent[]): EventGroup[] {
	const open: SyncedEvent[] = [];
	const closed: SyncedEvent[] = [];

	for (const e of events) {
		if (e.status === "open") {
			open.push(e);
		} else {
			closed.push(e);
		}
	}

	const groups: EventGroup[] = [];
	if (open.length > 0) groups.push({ label: "Open", events: open });
	if (closed.length > 0) groups.push({ label: "Closed", events: closed });
	return groups;
}

function EventList({ events }: EventListProps) {
	const { event: selected, onSelectEvent } = useSelectedEvent();
	const groups = useMemo(() => groupEvents(events), [events]);

	return (
		<div className="scrollbar-thin h-full w-full overflow-y-auto rounded-tl-lg border-t border-l">
			{groups.map((group) => (
				<div key={group.label}>
					<div
						data-slot="event-group-title"
						className="border-muted bg-muted flex items-center py-2 pr-4 pl-3 text-xs"
					>
						<div className="flex items-center gap-2">
							<span className="font-medium tracking-wide">{group.label}</span>
							<span>{group.events.length}</span>
						</div>
					</div>
					{group.events.map((e) => (
						<EventListItem
							key={e.id}
							event={e}
							isSelected={selected.id === e.id}
							onSelect={() => onSelectEvent(e.id)}
						/>
					))}
				</div>
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
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const progress =
		event.realBudget && event.realBudget > 0 ? (event.totalSpent / event.realBudget) * 100 : null;

	const clampedProgress = progress != null ? progress : null;

	const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
		if (e.code === "Enter" || e.code === "Space") {
			e.preventDefault();
			onSelect();
		}
	};

	return (
		<button
			type="button"
			onClick={onSelect}
			onKeyDown={handleKeyDown}
			className={cn(
				"border-b-border/50 hover:bg-muted/60 flex w-full flex-col gap-2 border-b py-3 pr-4 pl-3 text-left text-sm transition-colors outline-none",
				"focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-inset",
				isSelected && "ring-ring ring-2 ring-inset",
			)}
			data-slot="event-item"
			aria-label={`Select event ${event.title}`}
		>
			<span className="truncate font-medium">{event.title}</span>

			<EventDateRange startDate={event.start_date} endDate={event.end_date} />

			{/* Row 3: Spending + Budget */}
			<div className="flex items-baseline justify-between gap-2">
				<div className="flex items-baseline gap-1">
					<CurrencyValue
						value={event.totalSpent}
						currency={event.budget_currency || workspaceCurrency}
						className="text-[13px] font-semibold"
					/>
					{event.realBudget != null && (
						<div className="flex items-baseline gap-1">
							<span className="text-muted-foreground text-[11px]">/</span>
							{event.realBudget ? (
								<CurrencyValue
									value={event.realBudget}
									currency={event.budget_currency || workspaceCurrency}
									className="text-muted-foreground text-[12px]"
								/>
							) : (
								"∞"
							)}
						</div>
					)}
				</div>
			</div>

			{/* Row 4: Progress bar */}
			{clampedProgress != null && (
				<Progress value={clampedProgress} className="flex-row items-center gap-2">
					<ProgressTrack className="h-1.5 flex-1">
						<ProgressIndicator
							className={cn(
								clampedProgress >= 100
									? "bg-destructive"
									: clampedProgress >= 80
										? "bg-orange-400 dark:bg-orange-500"
										: "bg-emerald-500 dark:bg-emerald-400",
							)}
						/>
					</ProgressTrack>
					<span
						className={cn(
							"w-9 text-right text-[10px] font-medium tabular-nums",
							clampedProgress >= 100
								? "text-destructive"
								: clampedProgress >= 80
									? "text-orange-500 dark:text-orange-400"
									: "text-muted-foreground",
						)}
					>
						{Math.round(clampedProgress)}%
					</span>
				</Progress>
			)}
		</button>
	);
}

export default memo(EventList);
