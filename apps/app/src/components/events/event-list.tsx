import { CurrencyValue } from "#app/components/currency-value.tsx";
import { EventDateRange } from "#app/components/events/event-date-range.tsx";
import { type SyncedEvent, useLiveQueryEvents } from "#app/components/events/use-events.ts";
import { GroupedVirtualTable } from "#app/components/virtual-table/grouped-virtual-table.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { Progress, ProgressIndicator, ProgressTrack } from "@hoalu/ui/progress";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";

const GRID_TEMPLATE =
	"grid grid-cols-[1fr_var(--wallet-size)_var(--amount-size)_var(--amount-size)_var(--progress-size)_var(--status-size)]";

const columns: ColumnDef<SyncedEvent>[] = [
	{ id: "name", header: "Name" },
	{ id: "date", header: "Date" },
	{ id: "budget", header: "Budget", meta: { headerClassName: "justify-end" } },
	{ id: "spent", header: "Spent", meta: { headerClassName: "justify-end" } },
	{ id: "progress", header: "Progress" },
	{ id: "status", header: "Status" },
];

function EventContent(event: SyncedEvent) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const progress =
		event.realBudget && event.realBudget > 0
			? Math.min((event.totalSpent / event.realBudget) * 100, 999)
			: null;

	const progressColor =
		progress == null
			? ""
			: progress >= 100
				? "bg-destructive"
				: progress >= 80
					? "bg-orange-400 dark:bg-orange-500"
					: "bg-emerald-500 dark:bg-emerald-400";

	const progressTextColor =
		progress == null
			? ""
			: progress >= 100
				? "text-destructive"
				: progress >= 80
					? "text-orange-500 dark:text-orange-400"
					: "text-muted-foreground";

	return (
		<>
			<div className="flex items-center truncate px-4 py-3">
				<p className="truncate text-sm font-medium" title={event.title}>
					{event.title}
				</p>
			</div>
			<div className="flex items-center px-4 py-3">
				<EventDateRange startDate={event.start_date} endDate={event.end_date} />
			</div>
			<div className="flex items-center justify-end px-4 py-3">
				{event.realBudget ? (
					<CurrencyValue
						value={event.budget}
						currency={event.budget_currency || workspaceCurrency}
						className="text-sm font-medium"
					/>
				) : (
					<span className="text-muted-foreground text-sm">∞</span>
				)}
			</div>
			<div className="flex items-center justify-end px-4 py-3">
				<CurrencyValue
					value={event.totalSpent}
					currency={event.budget_currency || workspaceCurrency}
					className="text-sm font-semibold"
				/>
			</div>
			<div className="flex items-center gap-2 px-4 py-3">
				{progress != null ? (
					<Progress value={Math.min(progress, 100)} className="flex-row items-center gap-1.5">
						<ProgressTrack className="h-1.5 flex-1">
							<ProgressIndicator className={progressColor} />
						</ProgressTrack>
						<span
							className={cn(
								"w-8 text-right text-[10px] font-medium tabular-nums",
								progressTextColor,
							)}
						>
							{Math.round(progress)}%
						</span>
					</Progress>
				) : (
					<span className="text-muted-foreground text-sm">—</span>
				)}
			</div>
			<div className="flex items-center px-4 py-3">
				{event.status === "open" ? (
					<Badge variant="outline" className="text-success border-success/30 bg-success/10">
						Open
					</Badge>
				) : (
					<Badge variant="outline" className="text-muted-foreground">
						Closed
					</Badge>
				)}
			</div>
		</>
	);
}

const emptyState = (
	<Empty>
		<EmptyHeader>
			<EmptyTitle>No events</EmptyTitle>
			<EmptyDescription>Create your first event to group expenses and bills.</EmptyDescription>
		</EmptyHeader>
	</Empty>
);

function EventList() {
	const events = useLiveQueryEvents();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const sortedEvents = useMemo(
		() =>
			[...events].sort((a, b) => {
				if (!a.start_date && !b.start_date) return 0;
				if (!a.start_date) return 1;
				if (!b.start_date) return -1;
				return b.start_date.localeCompare(a.start_date);
			}),
		[events],
	);

	const handleSelect = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/events", params: { slug } });
				return;
			}
			navigate({ to: "/$slug/events/$eventId", params: { slug, eventId: id } }); // id is public_id via getItemId
		},
		[navigate, slug],
	);

	const renderRow = useCallback(
		(item: SyncedEvent, _isSelected: boolean) => <EventContent {...item} />,
		[],
	);

	return (
		<GroupedVirtualTable<SyncedEvent>
			items={sortedEvents}
			getItemId={(e) => e.public_id}
			columns={columns}
			gridTemplate={GRID_TEMPLATE}
			renderRow={renderRow}
			estimateRowSize={45}
			onSelectItem={handleSelect}
			enableKeyboardNav={true}
			emptyState={emptyState}
		/>
	);
}

export default memo(EventList);
