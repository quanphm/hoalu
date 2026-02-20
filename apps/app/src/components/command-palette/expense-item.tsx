import { formatCurrency } from "#app/helpers/currency.ts";
import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import { CommandItem } from "@hoalu/ui/command";

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
			className="hover:bg-foreground/5 focus-visible:ring-ring absolute top-0 left-0 flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus-visible:ring-2"
			style={style}
			onClick={onClick}
		>
			<div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
				<div className="flex min-w-0 items-center gap-2">
					<span className="truncate">{expense.title}</span>
					{expense.categoryName && (
						<span className="text-muted-foreground shrink-0 text-xs">{expense.categoryName}</span>
					)}
				</div>
				<span className="flex shrink-0 items-center gap-2 text-xs tabular-nums">
					<span className="text-muted-foreground">
						{datetime.format(expense.date, "MMM d, yyyy")}
					</span>
					<span className="font-mono font-bold">
						{formatCurrency(
							monetary.fromRealAmount(Number(expense.amount), expense.currency),
							expense.currency,
						)}
					</span>
				</span>
			</div>
		</CommandItem>
	);
}
