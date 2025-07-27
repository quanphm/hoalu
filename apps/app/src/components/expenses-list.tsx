import { useAtomValue } from "jotai";

import { datetime } from "@hoalu/common/datetime";
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

interface ExpenseListProps {
	data: [string, ExpenseWithClientConvertedSchema[]][];
	onRowClick(id: string | null): void;
}
export function ExpensesList({ data, onRowClick }: ExpenseListProps) {
	if (data.length === 0) {
		return (
			<p className="mx-4 rounded-lg bg-muted p-4 text-center text-base text-muted-foreground">
				No expenses found
			</p>
		);
	}

	return data.map(([date, value]) => (
		<div key={date} data-slot="expense-group">
			<div
				data-slot="expense-group-title"
				className="sticky top-0 flex items-center bg-muted py-2 pr-6 pl-3 text-xs"
			>
				<div className="flex items-center gap-1 font-semibold">
					<CalendarIcon className="size-3" /> {datetime.format(date, "dd/MM/yyyy")}
				</div>
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

interface ExpenseContentProps extends ExpenseWithClientConvertedSchema {
	onClick(id: string | null): void;
}
function ExpenseContent(props: ExpenseContentProps) {
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
				"flex items-start justify-between gap-4 border border-transparent border-b-border px-6 py-2 text-sm outline-none ring-0 hover:bg-muted/40",
				"last-of-type:border-b-transparent",
				selectedRow.id === props.id &&
					"border-blue-600 bg-blue-100 last-of-type:border-b-blue-600 hover:bg-blue-100 dark:bg-blue-950 hover:dark:bg-blue-950",
			)}
			role="button"
			tabIndex={0}
			onClick={() => props.onClick(props.id)}
			onKeyUp={handleKeyUp}
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
						<Badge className={createCategoryTheme(props.category.color)}>
							{props.category.name}
						</Badge>
					)}
					<Badge variant="outline" className="gap-1.5 bg-background">
						<span
							className={cn("size-2 rounded-full", createWalletTheme(props.wallet.type))}
							aria-hidden="true"
						/>
						{props.wallet.name}
					</Badge>
				</div>
			</div>
			<div className="flex flex-col items-end gap-1 text-right">
				<TransactionAmount data={props} />
			</div>
		</div>
	);
}

interface TotalExpenseByDateProps {
	data: ExpenseWithClientConvertedSchema[];
}
function TotalExpenseByDate(props: TotalExpenseByDateProps) {
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
