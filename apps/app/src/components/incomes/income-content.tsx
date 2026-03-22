import { useSelectedIncome, type SyncedIncome } from "#app/components/incomes/use-incomes.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";
import { useLayoutMode } from "#app/hooks/use-layout-mode.ts";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { memo } from "react";

import { TransactionAmount } from "../transaction-amount";
import { WalletBadge } from "../wallets/wallet-badge";

interface IncomeContentProps extends SyncedIncome {
	onClick(id: string | null): void;
}

function IncomeContent(props: IncomeContentProps) {
	const { income: selectedRow } = useSelectedIncome();
	const { shouldUseMobileLayout } = useLayoutMode();

	const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
		if (event.code === "Enter" || event.code === "Space") {
			event.preventDefault();
			event.stopPropagation();
			props.onClick(props.id);
		}
	};

	const handleFocus: React.FocusEventHandler<HTMLDivElement> = () => {
		// On mobile layout, skip auto-select on focus: when the dialog closes,
		// the browser restores focus to the last-focused list item, which would
		// immediately re-open the dialog via this handler.
		if (shouldUseMobileLayout) {
			return;
		}
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
				"border-b-border/50 hover:bg-muted/60 flex items-start justify-between gap-4 border-b text-sm outline-none",
				"focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-inset",
				selectedRow.id === props.id && "ring-ring ring-2 ring-inset",
				// Mobile: compact items, Desktop: normal padding
				shouldUseMobileLayout ? "px-3 py-2.5" : "py-2 pr-4 pl-3",
			)}
			data-slot="expense-item"
			aria-label={`Select expense ${props.title}`}
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
		>
			<div className="flex w-2/3 flex-col gap-0.5">
				<p className="font-medium">{props.title}</p>
				{props.description && (
					<div className="text-muted-foreground truncate leading-relaxed">
						{htmlToText(props.description)}
					</div>
				)}
				<div data-slot="item-tags" className="mt-0.5 flex origin-top-left scale-90 gap-1.5">
					{props.category.name && props.category.color ? (
						<Badge className={cn(createCategoryTheme(props.category.color))}>
							{props.category.name}
						</Badge>
					) : null}
					<WalletBadge {...props.wallet} />
				</div>
			</div>
			<div className="flex items-end justify-center gap-4 text-right">
				<TransactionAmount data={props} />
			</div>
		</div>
	);
}

export default memo(IncomeContent);
