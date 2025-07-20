import { useAtomValue } from "jotai";

import { CalendarIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { selectedExpenseAtom } from "@/atoms";
import { TransactionAmount } from "@/components/transaction-amount";
import { createCategoryTheme, createWalletTheme } from "@/helpers/colors";
import { formatCurrency } from "@/helpers/currency";
import { htmlToText } from "@/helpers/dom-parser";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";

export function ExpensesList({
	data,
	onRowClick,
}: {
	data: Map<string, ExpenseWithClientConvertedSchema[]>;
	onRowClick(id: string | null): void;
}) {
	return Array.from(data.entries()).map(([date, value]) => (
		<div key={date} data-slot="expense-group">
			<div
				data-slot="expense-group-title"
				className="sticky top-0 flex items-center bg-muted py-3 pr-6 pl-3 text-xs"
			>
				<div className="flex items-center gap-1">
					<CalendarIcon className="size-3" /> {date}
				</div>
				<span className="ml-2.5 font-bold">{value.length}</span>
				<div className="ml-auto">
					<TotalExpenseByDate data={value} />
				</div>
			</div>
			<div data-slot="expense-group-content" className="flex flex-col">
				{value.map((expense) => {
					return <ExpenseContent key={expense.id} {...expense} onClick={onRowClick} />;
				})}
			</div>
		</div>
	));
}

function ExpenseContent(
	props: ExpenseWithClientConvertedSchema & { onClick(id: string | null): void },
) {
	const selectedRow = useAtomValue(selectedExpenseAtom);

	const handleKeyUp: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
		if (event.key === "Escape") {
			props.onClick(null);
		} else {
			props.onClick(props.id);
		}
	};

	return (
		<div
			data-slot="expense-item"
			className={cn(
				"flex items-start gap-4 border border-transparent border-b-border py-3 pr-6 pl-3 text-sm hover:bg-muted/50",
				selectedRow.id === props.id && "border-primary bg-muted/50",
			)}
			role="button"
			tabIndex={0}
			onClick={() => props.onClick(props.id)}
			onKeyUp={handleKeyUp}
		>
			<div className="flex w-2/3 flex-col gap-1 leading-normal">
				<p>{props.title}</p>
				{props.description && (
					<div className="truncate text-muted-foreground text-xs">
						{htmlToText(props.description)}
					</div>
				)}
				<div className="mt-2 flex gap-2">
					{props.category && (
						<Badge className={createCategoryTheme(props.category.color)}>
							{props.category.name}
						</Badge>
					)}
				</div>
			</div>

			<div className="ml-auto flex flex-col gap-1 text-right">
				<TransactionAmount data={props} />
				<Badge variant="outline" className="gap-1.5">
					<span
						className={cn(
							"size-2 rounded-full bg-emerald-500",
							createWalletTheme(props.wallet.type),
						)}
						aria-hidden="true"
					/>
					{props.wallet.name}
				</Badge>
			</div>
		</div>
	);
}

function TotalExpenseByDate(props: { data: ExpenseWithClientConvertedSchema[] }) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const total = props.data.reduce((sum, current) => {
		const value = current.convertedAmount;
		return sum + (typeof value === "number" ? value : 0);
	}, 0);

	return (
		<span className="font-semibold text-base text-destructive tracking-tight">
			{formatCurrency(total as number, workspaceCurrency)}
		</span>
	);
}
