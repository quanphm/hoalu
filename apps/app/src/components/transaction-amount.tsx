import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseSchema } from "@/lib/schema";
import { exchangeRatesQueryOptions } from "@/services/query-options";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { useQuery } from "@tanstack/react-query";

export function TransactionAmount({ data }: { data: ExpenseSchema }) {
	const {
		metadata: { currency: targetCurr },
	} = useWorkspace();
	const { amount, realAmount, currency: sourceCurr } = data;
	const { data: rate, status } = useQuery(
		exchangeRatesQueryOptions({ from: sourceCurr, to: targetCurr }),
	);

	if (targetCurr === sourceCurr) {
		return <p className="font-medium">{formatCurrency(amount, targetCurr)}</p>;
	}

	if (status === "error") {
		return <p className="text-destructive">Error</p>;
	}

	if (!rate) {
		return <p className="text-muted-foreground">Converting...</p>;
	}

	const isNoCent = zeroDecimalCurrencies.find((c) => c === sourceCurr);
	const factor = isNoCent ? 1 : 100;
	const convertedValue = realAmount * (rate / factor);

	return (
		<div className="leading-relaxed">
			<p className="font-medium">{formatCurrency(convertedValue, targetCurr)}</p>
			{targetCurr !== sourceCurr && (
				<p className="text-muted-foreground text-xs tracking-tight">
					Original {formatCurrency(amount, sourceCurr)}
				</p>
			)}
		</div>
	);
}
