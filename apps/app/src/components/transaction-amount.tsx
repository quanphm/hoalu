import { useWorkspace } from "#app/hooks/use-workspace.ts";
import type { ExpenseWithClientConvertedSchema } from "#app/lib/schema.ts";
import { CurrencyValue } from "./currency-value";

export function TransactionAmount(props: { data: ExpenseWithClientConvertedSchema }) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const { amount, convertedAmount, currency: sourceCurrency } = props.data;

	if (convertedAmount === -1) {
		return <p className="text-destructive">Error</p>;
	}

	return (
		<div className="leading-normal">
			<CurrencyValue
				value={convertedAmount}
				currency={workspaceCurrency}
				className="font-medium"
				as="p"
			/>
			{workspaceCurrency !== sourceCurrency && (
				<CurrencyValue
					value={amount}
					currency={sourceCurrency}
					prefix="original"
					className="text-muted-foreground text-xs"
					as="p"
				/>
			)}
		</div>
	);
}
