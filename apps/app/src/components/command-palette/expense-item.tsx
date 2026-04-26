import { createCategoryTheme } from "#app/helpers/colors.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";
import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import { Badge } from "@hoalu/ui/badge";
import { CommandItem } from "@hoalu/ui/command";

import { HighlightedText } from "./highlighted-text.tsx";

import type { AutocompleteItem, ExpenseSearchResult } from "./types.ts";

interface ExpenseItemProps {
	expense: ExpenseSearchResult;
	autocompleteItem: AutocompleteItem;
	itemIndex: number;
	onClick: () => void;
}

export function ExpenseItem({ expense, autocompleteItem, itemIndex, onClick }: ExpenseItemProps) {
	return (
		<CommandItem
			value={autocompleteItem.id}
			index={itemIndex}
			className="hover:bg-foreground/5 focus-visible:ring-ring flex min-h-8 w-full cursor-default scroll-my-8 items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus-visible:ring-2"
			onClick={onClick}
		>
			<div className="flex flex-1 items-center justify-between gap-10 overflow-hidden">
				<div className="flex min-w-0 items-baseline gap-2">
					<span className="shrink-0 truncate">
						<HighlightedText text={expense.title} ranges={expense.titleRanges} />
					</span>
					<span className="text-muted-foreground truncate text-xs">
						<HighlightedText
							text={htmlToText(expense.description) ?? ""}
							ranges={expense.descriptionRanges}
						/>
					</span>
				</div>
				<span className="flex shrink-0 items-center gap-3 text-xs tabular-nums">
					{expense.categoryName && (
						<div className="hidden origin-right scale-90 items-center md:flex">
							<Badge className={createCategoryTheme(expense.categoryColor)}>
								{expense.categoryName}
							</Badge>
						</div>
					)}
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
