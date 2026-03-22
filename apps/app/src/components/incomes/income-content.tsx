import type { IncomeClient } from "#app/components/incomes/use-incomes.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { Badge } from "@hoalu/ui/badge";

interface Props {
	income: IncomeClient;
}

export function IncomeContent({ income }: Props) {
	const categoryClassName = income.category?.color
		? createCategoryTheme(income.category.color)
		: "bg-gray-100 text-gray-700";

	return (
		<div className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 cursor-pointer">
			<div className="flex flex-col gap-1">
				<span className="font-medium text-sm">{income.title}</span>
				{income.category && (
					<Badge className={categoryClassName} size="sm">
						{income.category.name}
					</Badge>
				)}
			</div>
			<div className="flex flex-col items-end gap-1">
				<span className="font-semibold text-sm text-green-600">
					+{formatCurrency(income.convertedAmount > 0 ? income.convertedAmount : 0, "USD")}
				</span>
				<span className="text-xs text-muted-foreground">{income.wallet.name}</span>
			</div>
		</div>
	);
}
