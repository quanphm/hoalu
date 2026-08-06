import { cn } from "@hoalu/ui/utils";

import { CurrencyValue } from "#app/components/currency-value.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";

interface TransactionAmountProps {
	amount: number;
	/** major units, workspace currency — `null` when no FX rate exists */
	convertedAmount: number | null;
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

	// No FX rate — show the original amount instead of a misleading ≈0
	if (convertedAmount === null) {
		return (
			<div className="flex flex-col items-end gap-0.5 leading-tight">
				<CurrencyValue
					value={amount}
					currency={sourceCurrency}
					className={cn("text-sm font-medium", className)}
					as="p"
				/>
			</div>
		);
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
