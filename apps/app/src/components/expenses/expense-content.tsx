import { useAtomValue } from "jotai";
import { memo } from "react";

import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";

import { selectedExpenseAtom } from "#app/atoms/index.ts";
import { TransactionAmount } from "#app/components/transaction-amount.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";
import type { ExpenseWithClientConvertedSchema } from "#app/lib/schema.ts";
import { WalletBadge } from "../wallets/wallet-badge";

interface ExpenseContentProps extends ExpenseWithClientConvertedSchema {
	onClick(id: string | null): void;
}

function ExpenseContent(props: ExpenseContentProps) {
	const selectedRow = useAtomValue(selectedExpenseAtom);

	const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
		if (event.code === "Enter" || event.code === "Space") {
			event.preventDefault();
			event.stopPropagation();
			props.onClick(props.id);
		}
	};

	return (
		<div
			id={props.id}
			className={cn(
				"flex items-start justify-between gap-4 border border-transparent border-b-border/50 py-2 pr-6 pl-3 text-sm outline-none hover:bg-muted/60",
				"focus-visible:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
				selectedRow.id === props.id && "bg-muted/80 ring-2 ring-ring ring-inset",
			)}
			data-slot="expense-item"
			role="button"
			tabIndex={0}
			onClick={() => props.onClick(props.id)}
			onKeyDown={handleKeyDown}
		>
			<div className="flex w-2/3 flex-col">
				<p>{props.title}</p>
				{props.description && (
					<div className="truncate text-muted-foreground text-xs">
						{htmlToText(props.description)}
					</div>
				)}
				<div data-slot="item-tags" className="mt-1 flex origin-left scale-85 gap-2">
					{props.category && (
						<Badge className={cn(createCategoryTheme(props.category.color))}>
							{props.category.name}
						</Badge>
					)}
					<WalletBadge {...props.wallet} />
				</div>
			</div>
			<div className="flex flex-col items-end gap-1 text-right">
				<TransactionAmount data={props} />
			</div>
		</div>
	);
}

export default memo(ExpenseContent);
