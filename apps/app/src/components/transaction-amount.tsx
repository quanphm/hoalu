import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { cn } from "@hoalu/ui/utils";

import { CurrencyValue } from "./currency-value";

interface TransactionAmountProps {
	amount: number;
	convertedAmount: number;
	currency: string;
}

export function TransactionAmount({
	type = "neutral",
	data: { amount, convertedAmount, currency: sourceCurrency },
	className,
}: {
	type?: "expense" | "income" | "neutral";
	data: TransactionAmountProps;
	className?: string;
}) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	if (convertedAmount === -1) {
		return <p className="text-destructive">Error</p>;
	}

	const prefix = `${workspaceCurrency !== sourceCurrency ? "≈" : ""}${type === "expense" ? "-" : type === "income" ? "+" : ""}`;

	return (
		<div className="flex flex-col items-end gap-0.5 leading-tight">
			<CurrencyValue
				value={convertedAmount}
				currency={workspaceCurrency}
				prefix={prefix}
				as="p"
				className={cn("text-sm font-medium", className)}
			/>
			{workspaceCurrency !== sourceCurrency && (
				<CurrencyValue
					value={amount}
					currency={sourceCurrency}
					prefix="original "
					className="text-muted-foreground text-xs"
					as="p"
				/>
			)}
		</div>
	);
}
