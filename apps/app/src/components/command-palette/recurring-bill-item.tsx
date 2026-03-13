import { createCategoryTheme } from "#app/helpers/colors.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { CommandItem } from "@hoalu/ui/command";

import type { AutocompleteItem, UpcomingBillItem } from "./types.ts";

interface RecurringBillItemProps {
	bill: UpcomingBillItem;
	autocompleteItem: AutocompleteItem;
	itemIndex: number;
	style: React.CSSProperties;
	onClick: () => void;
}

export function RecurringBillItem({
	bill,
	autocompleteItem,
	itemIndex,
	style,
	onClick,
}: RecurringBillItemProps) {
	return (
		<CommandItem
			value={autocompleteItem.id}
			index={itemIndex}
			className="hover:bg-foreground/5 focus-visible:ring-ring absolute top-0 left-0 flex min-h-8 w-full cursor-default scroll-mt-4 items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus-visible:ring-2"
			style={style}
			onClick={onClick}
		>
			<div className="flex flex-1 items-center justify-between gap-10 overflow-hidden">
				<div className="flex min-w-0 items-baseline gap-2">
					<span className="shrink-0 truncate">{bill.title}</span>
					<span className="text-muted-foreground truncate text-xs">{bill.walletName}</span>
				</div>
				<span className="flex shrink-0 items-center gap-3 text-xs tabular-nums">
					{bill.categoryName && bill.categoryColor && (
						<div className="flex origin-right scale-90 items-center">
							<Badge className={createCategoryTheme(bill.categoryColor)}>{bill.categoryName}</Badge>
						</div>
					)}
					<span className="text-muted-foreground">
						{datetime.format(new Date(`${bill.date}T00:00:00`), "MMM d, yyyy")}
					</span>
					<span className="font-mono font-bold">~{formatCurrency(bill.amount, bill.currency)}</span>
				</span>
			</div>
		</CommandItem>
	);
}
