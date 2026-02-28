import { CurrencyValue } from "#app/components/currency-value.tsx";
import {
	type SyncedRecurringBill,
	useSelectedRecurringBill,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { cn } from "@hoalu/ui/utils";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";

interface RecurringBillListProps {
	bills: SyncedRecurringBill[];
}

export function RecurringBillList({ bills }: RecurringBillListProps) {
	const { bill: selected, onSelectBill } = useSelectedRecurringBill();

	if (bills.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No recurring bills</EmptyTitle>
					<EmptyDescription>Set up your first recurring bill to track subscriptions and regular payments.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col divide-y">
			{bills.map((bill) => (
				<RecurringBillRow
					key={bill.id}
					bill={bill}
					isSelected={selected.id === bill.id}
					onSelect={() => onSelectBill(selected.id === bill.id ? null : bill.id)}
				/>
			))}
		</div>
	);
}

interface RecurringBillRowProps {
	bill: SyncedRecurringBill;
	isSelected: boolean;
	onSelect: () => void;
}

function RecurringBillRow({ bill, isSelected, onSelect }: RecurringBillRowProps) {
	const repeatLabel =
		AVAILABLE_REPEAT_OPTIONS.find((o) => o.value === bill.repeat)?.label ?? bill.repeat;

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
				"hover:bg-muted/50",
				isSelected && "bg-muted",
			)}
		>
			<span
				className={cn(
					"h-8 w-1 shrink-0 rounded-full",
					bill.category_color
						? getCategoryStripeColor(bill.category_color)
						: "bg-muted-foreground/30",
				)}
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium">{bill.title}</p>
				<p className="text-muted-foreground text-xs">{bill.wallet_name ?? repeatLabel}</p>
			</div>
			<div className="flex shrink-0 flex-col items-end gap-1">
				<CurrencyValue value={bill.amount} currency={bill.currency} className="text-sm font-semibold" />
				{bill.category_name && bill.category_color && (
					<Badge
						className={cn(
							"h-4 px-1 py-0 text-[9px] leading-none",
							createCategoryTheme(
								bill.category_color as Parameters<typeof createCategoryTheme>[0],
							),
						)}
					>
						{bill.category_name}
					</Badge>
				)}
			</div>
		</button>
	);
}

const colorMap: Record<string, string> = {
	red: "bg-red-400",
	green: "bg-emerald-400",
	teal: "bg-teal-400",
	blue: "bg-blue-400",
	yellow: "bg-amber-300",
	orange: "bg-orange-400",
	purple: "bg-violet-400",
	pink: "bg-pink-400",
	gray: "bg-slate-300",
	indigo: "bg-indigo-400",
};

function getCategoryStripeColor(color: string): string {
	return colorMap[color] ?? "bg-muted-foreground/30";
}
