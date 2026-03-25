import { useWorkspace } from "#app/hooks/use-workspace.ts";

import { CurrencyValue } from "./currency-value";

interface TransactionAmountProps {
	amount: number;
	convertedAmount: number;
	currency: string;
}

export function TransactionAmount(props: { data: TransactionAmountProps }) {
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
				prefix={workspaceCurrency !== sourceCurrency ? "≈" : undefined}
				as="p"
				className="text-[14px] font-semibold"
			/>
			{workspaceCurrency !== sourceCurrency && (
				<CurrencyValue
					value={amount}
					currency={sourceCurrency}
					prefix="original "
					className="text-muted-foreground/70 text-[10px]"
					as="p"
				/>
			)}
		</div>
	);
}
