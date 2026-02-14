import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import { CommandItem } from "@hoalu/ui/command";

import { formatCurrency } from "#app/helpers/currency.ts";

import type { AutocompleteItem, ExpenseSearchResult } from "./types.ts";

interface ExpenseItemProps {
	expense: ExpenseSearchResult;
	autocompleteItem: AutocompleteItem;
	itemIndex: number;
	style: React.CSSProperties;
	onClick: () => void;
}

export function ExpenseItem({
	expense,
	autocompleteItem,
	itemIndex,
	style,
	onClick,
}: ExpenseItemProps) {
	return (
		<CommandItem
			value={autocompleteItem}
			index={itemIndex}
			className="hover:bg-foreground/10 focus-visible:ring-ring absolute top-0 left-0 flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus-visible:ring-2"
			style={style}
			onClick={onClick}
		>
			<div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
				<div className="flex min-w-0 items-center gap-2">
					<span className="truncate">{expense.title}</span>
					<span className="text-muted-foreground shrink-0 text-xs">
						{expense.categoryName && `${expense.categoryName} · `}
						{datetime.format(expense.date, "MMM d, yyyy")}
					</span>
				</div>
				<span className="font-mono text-xs font-bold tabular-nums">
					{formatCurrency(
						monetary.fromRealAmount(Number(expense.amount), expense.currency),
						expense.currency,
					)}
				</span>
			</div>
		</CommandItem>
	);
}
