import type { IncomeClient } from "#app/components/incomes/use-incomes.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";

interface Props {
	income: IncomeClient;
	selected?: boolean;
	onClick?: (id: string) => void;
}

export function IncomeContent({ income, selected, onClick }: Props) {
	const categoryClassName = income.category?.color
		? createCategoryTheme(income.category.color)
		: "bg-gray-100 text-gray-700";

	return (
		<div
			className={cn(
				"flex cursor-pointer items-center justify-between px-3 py-2 transition-colors",
				selected ? "bg-muted" : "hover:bg-muted/50",
			)}
			onClick={() => onClick?.(income.id)}
		>
			<div className="flex flex-col gap-1">
				<span className="text-sm font-medium">{income.title}</span>
				{income.category && (
					<Badge className={categoryClassName} size="sm">
						{income.category.name}
					</Badge>
				)}
			</div>
			<div className="flex flex-col items-end gap-1">
				<span className="text-sm font-semibold text-green-600">
					+{formatCurrency(income.convertedAmount > 0 ? income.convertedAmount : 0, "USD")}
				</span>
				<span className="text-xs text-muted-foreground">{income.wallet.name}</span>
			</div>
		</div>
	);
}
