import { type SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { TransactionAmount } from "#app/components/transaction-amount.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { memo } from "react";

import { WalletBadge } from "../wallets/wallet-badge";

function ExpenseContent(props: SyncedExpense) {
	return (
		<>
			<div className="flex items-center px-4 py-3">
				<div className="flex items-center gap-2">
					{props.category.name ? (
						<Badge className={cn(createCategoryTheme(props.category.color))}>
							{props.category.name}
						</Badge>
					) : (
						<span className="text-muted-foreground text-sm">—</span>
					)}
				</div>
			</div>

			<div className="flex items-baseline-last justify-start gap-2 truncate px-4 py-3">
				<p className="text-sm font-medium" title={props.title}>
					{props.title}
				</p>
				{props.description && (
					<p className="text-muted-foreground text-xs">{htmlToText(props.description)}</p>
				)}
			</div>

			<div className="flex items-center px-4 py-3">
				<WalletBadge {...props.wallet} />
			</div>

			<div className="flex items-center justify-end px-4 py-3">
				<TransactionAmount type="expense" data={props} />
			</div>
		</>
	);
}

export default memo(ExpenseContent);
