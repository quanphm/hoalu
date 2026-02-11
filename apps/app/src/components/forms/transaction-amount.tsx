import { AVAILABLE_CURRENCY_OPTIONS } from "#app/helpers/constants.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { CalculatorIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Input } from "@hoalu/ui/input";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "@hoalu/ui/number-field";
import { SelectNative } from "@hoalu/ui/select-native";
import { cn } from "@hoalu/ui/utils";
import { useEffect, useRef, useState } from "react";

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

function evaluateExpression(expression: string): number | null {
	try {
		const sanitized = expression.replace(/x/gi, "*").replace(/[^0-9+\-*/().\s]/g, "");
		if (!sanitized.trim()) {
			return null;
		}

		const result = Function(`'use strict'; return (${sanitized})`)();
		if (typeof result === "number" && Number.isFinite(result)) {
			return result;
		}
		return null;
	} catch {
		return null;
	}
}

export function TransactionAmountField(props: Props) {
	const field = useFieldContext<TransactionAmountValue>();
	const [isCalculatorMode, setIsCalculatorMode] = useState(false);
	const [expression, setExpression] = useState("");
	const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isCalculatorMode) {
			if (inputRef.current) {
				inputRef.current.focus();
			}

			if (field.state.value.value) {
				setExpression(`${field.state.value.value}`);
				const result = evaluateExpression(`${field.state.value.value}`);
				setCalculatedValue(result);
			}
		}
	}, [isCalculatorMode, field.state.value.value]);

	const handleValueChange = (value: number | null) => {
		field.setValue((state) => ({
			...state,
			value: value ?? 0,
		}));
	};

	const handleCurrencyChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
		field.setValue((state) => ({
			...state,
			currency: e.target.value,
		}));
	};

	const handleExpressionChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const value = e.target.value;
		setExpression(`${value}`);
		const result = evaluateExpression(value);
		setCalculatedValue(result);
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		e.stopPropagation();
		if (e.key === "Enter" && calculatedValue !== null) {
			handleValueChange(calculatedValue);
			setIsCalculatorMode(false);
			setExpression("");
			setCalculatedValue(null);
		}
		if (e.key === "Escape") {
			setIsCalculatorMode(false);
			setExpression("");
			setCalculatedValue(null);
		}
	};

	const handleBlur = () => {
		if (calculatedValue !== null) {
			handleValueChange(calculatedValue);
		}
		setIsCalculatorMode(false);
		setExpression("");
		setCalculatedValue(null);
	};

	const toggleCalculatorMode = () => {
		setIsCalculatorMode(!isCalculatorMode);
		if (!isCalculatorMode) {
			setExpression(field.state.value.value.toString());
		}
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="isolate flex rounded-md">
				<SelectNative
					className="bg-muted w-[80px] rounded-e-none"
					value={field.state.value.currency}
					onBlur={field.handleBlur}
					onChange={handleCurrencyChange}
				>
					{AVAILABLE_CURRENCY_OPTIONS.map((currency) => (
						<option key={currency.value}>{currency.label}</option>
					))}
				</SelectNative>
				<FieldControl>
					{isCalculatorMode ? (
						<div className="relative -ms-px flex-1">
							<Input
								ref={inputRef}
								value={expression}
								onChange={handleExpressionChange}
								onKeyDown={handleKeyDown}
								onBlur={handleBlur}
								placeholder="100+50*2"
								className="h-9 rounded-s-none"
							/>
							{calculatedValue !== null && (
								<div className="text-muted-foreground absolute right-3 -bottom-6 left-3 text-xs">
									= {formatCurrency(calculatedValue, field.state.value.currency)}
								</div>
							)}
						</div>
					) : (
						<div className="relative -ms-px flex-1">
							<NumberField
								value={field.state.value.value}
								format={{
									style: "currency",
									currency: field.state.value.currency,
									currencyDisplay: "symbol",
									currencySign: "accounting",
								}}
								onBlur={field.handleBlur}
								onValueChange={handleValueChange}
								min={0}
								step={0.01}
								className="flex-1"
							>
								<NumberFieldGroup
									className={cn(
										"border-input data-focus-within:border-ring data-focus-within:ring-ring/20 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border text-sm whitespace-nowrap outline-none focus-visible:outline-none data-disabled:opacity-50 data-focus-within:ring-[3px]",
										"rounded-s-none data-focus-within:z-10",
									)}
								>
									<NumberFieldInput className="bg-background text-foreground flex-1 px-3 py-2 tabular-nums outline-none" />
								</NumberFieldGroup>
							</NumberField>
							<Button
								onClick={toggleCalculatorMode}
								className="absolute top-1/2 right-2 -translate-y-1/2"
								title="Calculator ON"
								variant="ghost"
								size="icon"
							>
								<CalculatorIcon className="text-muted-foreground size-4" />
							</Button>
						</div>
					)}
				</FieldControl>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
