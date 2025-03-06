import { Group, Input, NumberField } from "react-aria-components";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./components";
import { useFieldContext } from "./context";

interface TransactionAmountFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function TransactionAmountField(props: TransactionAmountFieldProps) {
	const field = useFieldContext<number>();

	return (
		<NumberField
			value={field.state.value}
			formatOptions={{
				style: "currency",
				currency: "USD",
				currencyDisplay: "symbol",
				currencySign: "standard",
			}}
		>
			<FormItem>
				{props.label && <FormLabel>{props.label}</FormLabel>}
				<Group className="doutline-none relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-xs transition-[color,box-shadow] data-focus-within:border-ring data-disabled:opacity-50 data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40">
					<FormControl>
						<Input className="flex-1 bg-background px-3 py-2 text-foreground tabular-nums" />
					</FormControl>
				</Group>
				{props.description && <FormDescription>{props.description}</FormDescription>}
				<FormMessage />
			</FormItem>
		</NumberField>
	);
}
