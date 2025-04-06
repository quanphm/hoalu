import { AVAILABLE_CURRENCY_OPTIONS } from "@/helpers/constants";
import { SelectNative } from "@hoalu/ui/select-native";
import { cn } from "@hoalu/ui/utils";
import { Group, Input, NumberField } from "react-aria-components";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface TransactionAmountValue {
	value: number;
	currency: string;
}

interface Props {
	label?: React.ReactNode;
	description?: string;
}

export function TransactionAmountField(props: Props) {
	const field = useFieldContext<TransactionAmountValue>();

	const handleValueChange = (value: number) => {
		field.setValue((state) => ({
			...state,
			value,
		}));
	};

	const handleCurrencyChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
		field.setValue((state) => ({
			...state,
			currency: e.target.value,
		}));
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="isolate flex rounded-md">
				<SelectNative
					className="w-[80px] rounded-e-none bg-muted"
					value={field.state.value.currency}
					onBlur={field.handleBlur}
					onChange={handleCurrencyChange}
				>
					{AVAILABLE_CURRENCY_OPTIONS.map((currency) => (
						<option key={currency.value}>{currency.label}</option>
					))}
				</SelectNative>
				<FieldControl>
					<NumberField
						value={field.state.value.value}
						formatOptions={{
							style: "currency",
							currency: field.state.value.currency,
							currencyDisplay: "symbol",
							currencySign: "accounting",
						}}
						onBlur={field.handleBlur}
						onChange={handleValueChange}
						minValue={0}
						className="-me-px flex-1"
					>
						<Group
							className={cn(
								"doutline-none relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm focus-visible:outline-none data-focus-within:border-ring data-disabled:opacity-50 data-focus-within:ring-[3px] data-focus-within:ring-ring/20 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40",
								"rounded-s-none data-focus-within:z-10",
							)}
						>
							<Input className="flex-1 bg-background px-3 py-2 text-foreground tabular-nums outline-none" />
						</Group>
					</NumberField>
				</FieldControl>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
