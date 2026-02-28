import { CurrencyValue } from "#app/components/currency-value.tsx";
import {
	type SyncedRecurringBill,
	useSelectedRecurringBill,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useMemo } from "react";

interface RecurringBillRowProps {
	bill: SyncedRecurringBill;
	isSelected: boolean;
	onSelect: () => void;
}

function RecurringBillRow({ bill, isSelected, onSelect }: RecurringBillRowProps) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const repeatLabel =
		AVAILABLE_REPEAT_OPTIONS.find((o) => o.value === bill.repeat)?.label ?? bill.repeat;
	const isForeignCurrency = bill.currency !== workspaceCurrency;

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"flex w-full items-center gap-0 overflow-hidden py-2 pr-4 pl-3 text-left",
				"hover:bg-muted/50",
				isSelected && "ring-ring ring-2 ring-inset",
			)}
		>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="truncate text-sm font-medium">{bill.title}</p>
				<div className="flex items-center gap-1.5">
					<p className="text-muted-foreground text-xs">{repeatLabel}</p>
					{bill.category_name && bill.category_color && (
						<Badge
							className={cn(
								"origin-left scale-90",
								createCategoryTheme(
									bill.category_color as Parameters<typeof createCategoryTheme>[0],
								),
							)}
						>
							{bill.category_name}
						</Badge>
					)}
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2 pr-1">
				<div className="flex flex-col items-end gap-0.5 leading-tight">
					<CurrencyValue
						value={isForeignCurrency ? bill.convertedAmount : bill.amount}
						currency={isForeignCurrency ? workspaceCurrency : bill.currency}
						prefix={isForeignCurrency ? "~" : undefined}
						className="text-[14px] font-semibold"
					/>
					{isForeignCurrency && (
						<CurrencyValue
							value={bill.amount}
							currency={bill.currency}
							prefix="original"
							className="text-muted-foreground/70 text-[10px]"
							as="p"
						/>
					)}
				</div>
			</div>
		</button>
	);
}

function EmptyState() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No recurring bills</EmptyTitle>
				<EmptyDescription>
					Set up your first recurring bill to track subscriptions and regular payments.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

interface RecurringBillListProps {
	bills: SyncedRecurringBill[];
}

export function RecurringBillList({ bills }: RecurringBillListProps) {
	const { bill: selected, onSelectBill } = useSelectedRecurringBill();
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const total = useMemo(() => {
		let sum = 0;
		for (const bill of bills) {
			if (bill.currency === workspaceCurrency) {
				sum += bill.amount;
			} else if (bill.convertedAmount > 0) {
				sum += bill.convertedAmount;
			}
		}
		return sum;
	}, [bills, workspaceCurrency]);

	if (bills.length === 0) {
		return <EmptyState />;
	}

	return (
		<div
			data-slot="recurring-bills-list-container"
			className={cn("scrollbar-thin h-full w-full overflow-y-auto contain-strict")}
		>
			<div className="relative flex h-full w-full flex-col divide-y rounded-tl-lg border-t border-l">
				<div className="border-muted bg-muted flex items-center py-2 pr-4 pl-3 text-sm">
					<span>Total</span>
					<div className="ml-auto">
						<CurrencyValue
							value={total}
							currency={workspaceCurrency}
							className="text-destructive font-semibold"
						/>
					</div>
				</div>
				{bills.map((bill) => (
					<RecurringBillRow
						key={bill.id}
						bill={bill}
						isSelected={selected.id === bill.id}
						onSelect={() => onSelectBill(selected.id === bill.id ? null : bill.id)}
					/>
				))}
			</div>
		</div>
	);
}
