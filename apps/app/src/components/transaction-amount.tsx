import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";

export function TransactionAmount(props: { data: ExpenseWithClientConvertedSchema }) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const { amount, convertedAmount, currency: sourceCurrency } = props.data;

	if (convertedAmount === -1) {
		return <p className="text-destructive">Error</p>;
	}

	// if (status === "pending") {
	// 	return <p className="text-muted-foreground">Converting...</p>;
	// }

	return (
		<div className="leading-relaxed">
			<p className="font-medium">{formatCurrency(convertedAmount, workspaceCurrency)}</p>
			{workspaceCurrency !== sourceCurrency && (
				<p className="text-muted-foreground text-xs tracking-tight">
					Original {formatCurrency(amount, sourceCurrency)}
				</p>
			)}
		</div>
	);
}
