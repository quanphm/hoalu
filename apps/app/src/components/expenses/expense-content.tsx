import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { memo } from "react";

import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { TransactionAmount } from "#app/components/transaction-amount.tsx";
import { type SyncedTransaction } from "#app/components/transactions/use-transactions.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";

import { WalletBadge } from "../wallets/wallet-badge";

function ExpenseContent(props: SyncedTransaction) {
	const { shouldUseMobileLayout } = useLayoutMode();

	if (shouldUseMobileLayout) {
		return (
			<>
				<CategoryCell category={props.category} />
				<TitleCell title={props.title} description={props.description} />
				<AmountCell data={props} />
			</>
		);
	}

	return (
		<>
			<CategoryCell category={props.category} />
			<TitleCell title={props.title} description={props.description} />
			{props.kind === "income" ? <AmountCell data={props} /> : <AmountEmptyCell />}
			{props.kind === "expense" ? <AmountCell data={props} /> : <AmountEmptyCell />}
			<WalletCell wallet={props.wallet} />
		</>
	);
}

function CategoryCell({ category }: { category: SyncedTransaction["category"] }) {
	return (
		<div className="flex items-center px-4 py-3">
			{category.name ? (
				<Badge className={cn(createCategoryTheme(category.color))}>{category.name}</Badge>
			) : (
				<span className="text-muted-foreground text-sm">—</span>
			)}
		</div>
	);
}

function TitleCell({ title, description }: { title: string; description?: string | null }) {
	return (
		<div className="flex min-w-0 items-center justify-start gap-2 overflow-hidden px-4 py-3">
			<p className="text-muted-foreground truncate text-xs" title={title}>
				<span className="text-foreground mr-2 text-sm font-medium">{title}</span>
				{description && htmlToText(description)}
			</p>
		</div>
	);
}

function AmountCell({ data }: { data: SyncedTransaction }) {
	return (
		<div className="flex items-center justify-end px-4 py-3">
			<TransactionAmount type={data.kind} data={data} />
		</div>
	);
}

function AmountEmptyCell() {
	return (
		<div className="flex items-center justify-end px-4 py-3">
			<span className="text-muted-foreground text-sm">-</span>
		</div>
	);
}

function WalletCell({ wallet }: { wallet: SyncedTransaction["wallet"] }) {
	return (
		<div className="flex items-center px-4 py-3">
			<WalletBadge {...wallet} />
		</div>
	);
}

export default memo(ExpenseContent);
