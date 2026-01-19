import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { CurrencyValue } from "./currency-value";

export function TransactionAmount(props: { data: SyncedExpense }) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const { amount, convertedAmount, currency: sourceCurrency } = props.data;

	if (convertedAmount === -1) {
		return <p className="text-destructive">Error</p>;
	}

	return (
		<div className="flex flex-col items-end gap-0.5 leading-tight">
			<CurrencyValue
				value={convertedAmount}
				currency={workspaceCurrency}
				className="font-semibold text-base tabular-nums"
				prefix={workspaceCurrency !== sourceCurrency ? "≈" : undefined}
				as="p"
			/>
			{workspaceCurrency !== sourceCurrency && (
				<CurrencyValue
					value={amount}
					currency={sourceCurrency}
					prefix="original"
					className="text-[10px] text-muted-foreground/70 tabular-nums"
					as="p"
				/>
			)}
		</div>
	);
}
