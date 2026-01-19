import { useAtomValue } from "jotai";
import { memo } from "react";

import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";

import { selectedExpenseAtom } from "#app/atoms/index.ts";
import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { TransactionAmount } from "#app/components/transaction-amount.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";
import { WalletBadge } from "../wallets/wallet-badge";

interface ExpenseContentProps extends SyncedExpense {
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

	const handleFocus: React.FocusEventHandler<HTMLDivElement> = () => {
		props.onClick(props.id);
	};

	const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
		props.onClick(props.id);
		event.currentTarget.focus();
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
			aria-label={`Select expense ${props.title}`}
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
		>
			<div className="flex w-2/3 flex-col gap-1">
				<p className="font-medium">{props.title}</p>
				{props.description && (
					<div className="truncate text-muted-foreground text-xs leading-relaxed">
						{htmlToText(props.description)}
					</div>
				)}
				<div data-slot="item-tags" className="mt-0.5 flex gap-1.5">
					{props.category.name && props.category.color && (
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
