import { CalculatorIcon, CaretDownIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { Input } from "@hoalu/ui/input";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "@hoalu/ui/number-field";
import { SelectNative } from "@hoalu/ui/select-native";
import { cn } from "@hoalu/ui/utils";
import { useEffect, useRef, useState } from "react";

import { AVAILABLE_CURRENCY_OPTIONS } from "#app/helpers/constants.ts";
import { formatCurrency } from "#app/helpers/currency.ts";

import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

export interface TransactionAmountValue {
	value: number;
	currency: string;
}

interface Props {
	label?: React.ReactNode;
	description?: string;
}

interface TransactionAmountInputProps {
	value: number;
	currency: string;
	onValueChange: (value: number) => void;
	onCurrencyChange: (currency: string) => void;
	onBlur?: () => void;
	/** `hero` is the transaction page's display-scale figure; `compact` is a bordered field. */
	variant?: "compact" | "hero";
	sign?: "expense" | "income";
	/** Enter pressed outside calculator mode, used to advance or commit the form. */
	onEnter?: () => void;
	/** Lets the surrounding form move focus here, e.g. from the title field. */
	inputId?: string;
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

function CurrencySuffix(props: {
	currency: string;
	onCurrencyChange: (currency: string) => void;
	onBlur?: () => void;
}) {
	return (
		<span className="relative flex shrink-0 items-center">
			<select
				aria-label="Amount currency"
				value={props.currency}
				onBlur={props.onBlur}
				onChange={(e) => props.onCurrencyChange(e.target.value)}
				className="text-muted-foreground hover:bg-accent/40 hover:text-foreground focus-visible:ring-ring/40 h-6 cursor-pointer appearance-none rounded-sm bg-transparent ps-1.5 pe-4 text-xs font-medium tracking-wide uppercase tabular-nums transition-colors outline-none focus-visible:ring-2"
			>
				{AVAILABLE_CURRENCY_OPTIONS.map((c) => (
					<option key={c.value} value={c.value}>
						{c.label}
					</option>
				))}
			</select>
			<CaretDownIcon
				aria-hidden="true"
				className="text-muted-foreground pointer-events-none absolute end-0.5 size-3"
			/>
		</span>
	);
}

export function TransactionAmountInput({
	value,
	currency,
	onValueChange,
	onCurrencyChange,
	onBlur,
	variant = "compact",
	sign,
	onEnter,
	inputId,
}: TransactionAmountInputProps) {
	const [isCalculatorMode, setIsCalculatorMode] = useState(false);
	const [expression, setExpression] = useState("");
	const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isCalculatorMode) {
			if (inputRef.current) {
				inputRef.current.focus();
			}
			if (value) {
				setExpression(`${value}`);
				const result = evaluateExpression(`${value}`);
				setCalculatedValue(result);
			}
		}
	}, [isCalculatorMode, value]);

	const handleExpressionChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const v = e.target.value;
		setExpression(v);
		const result = evaluateExpression(v);
		setCalculatedValue(result);
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		e.stopPropagation();
		if (e.key === "Enter" && calculatedValue !== null) {
			onValueChange(calculatedValue);
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

	const handleCalculatorBlur = () => {
		if (calculatedValue !== null) {
			onValueChange(calculatedValue);
		}
		setIsCalculatorMode(false);
		setExpression("");
		setCalculatedValue(null);
		onBlur?.();
	};

	const toggleCalculatorMode = () => {
		setIsCalculatorMode((prev) => {
			if (!prev) setExpression(value.toString());
			return !prev;
		});
	};

	const calculator = (
		<Button
			type="button"
			onClick={toggleCalculatorMode}
			title={isCalculatorMode ? "Calculator off" : "Calculator on"}
			aria-pressed={isCalculatorMode}
			variant="ghost"
			size={variant === "hero" ? "icon-sm" : "icon"}
			tabIndex={-1}
			className={cn(variant === "hero" && "text-muted-foreground shrink-0")}
		>
			<CalculatorIcon className="size-4" />
		</Button>
	);

	const calculatorInput = (className: string) => (
		<div className="relative min-w-0 flex-1">
			<Input
				ref={inputRef}
				value={expression}
				onChange={handleExpressionChange}
				onKeyDown={handleKeyDown}
				onBlur={handleCalculatorBlur}
				placeholder="100+50*2"
				className={className}
			/>
			{calculatedValue !== null && (
				<div className="text-muted-foreground absolute right-3 -bottom-6 left-3 text-xs">
					= {formatCurrency(calculatedValue, currency)}
				</div>
			)}
		</div>
	);

	const hero = variant === "hero";

	const handleAmountKeyDown: React.KeyboardEventHandler<HTMLInputElement> | undefined = onEnter
		? (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					onEnter();
				}
			}
		: undefined;

	const amountInput = (
		<NumberField
			value={value}
			format={{
				style: "currency",
				currency,
				currencyDisplay: "symbol",
				currencySign: "accounting",
			}}
			onBlur={onBlur}
			onValueChange={(v) => onValueChange(v ?? 0)}
			min={0}
			step={0.01}
			className="min-w-0"
		>
			<NumberFieldGroup
				className={cn(
					hero
						? "flex min-w-0 items-center"
						: "border-input data-focus-within:border-ring data-focus-within:ring-ring/20 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border text-sm whitespace-nowrap outline-none focus-visible:outline-none data-disabled:opacity-50 data-focus-within:ring-[3px]",
				)}
			>
				{sign && (
					<span
						aria-hidden="true"
						className={cn(
							"shrink-0 select-none",
							hero
								? "text-muted-foreground pe-1 text-xl font-medium"
								: cn(
										"px-3 text-base font-semibold",
										sign === "expense" ? "text-destructive" : "text-success",
									),
						)}
					>
						{sign === "expense" ? "−" : "+"}
					</span>
				)}
				<NumberFieldInput
					id={inputId}
					aria-label="Amount"
					onKeyDown={handleAmountKeyDown}
					className={cn(
						hero
							? "field-sizing-content h-10 max-w-full min-w-6 border-none bg-transparent p-0 text-3xl font-medium tracking-tight tabular-nums outline-none"
							: "bg-background text-foreground flex-1 px-3 py-2 tabular-nums outline-none",
						hero && !value && "text-muted-foreground/50",
					)}
				/>
			</NumberFieldGroup>
		</NumberField>
	);

	if (hero) {
		return (
			<div className="flex w-full min-w-0 items-center gap-1.5">
				{isCalculatorMode
					? calculatorInput(
							"h-10 max-w-xs border-none bg-transparent px-0 shadow-none *:h-10! *:text-2xl!",
						)
					: amountInput}
				<CurrencySuffix currency={currency} onCurrencyChange={onCurrencyChange} onBlur={onBlur} />
				{calculator}
			</div>
		);
	}

	return (
		<div className="isolate flex items-center gap-2">
			<SelectNative
				className="bg-muted w-[88px] shrink-0"
				value={currency}
				onBlur={onBlur}
				onChange={(e) => onCurrencyChange(e.target.value)}
			>
				{AVAILABLE_CURRENCY_OPTIONS.map((c) => (
					<option key={c.value}>{c.label}</option>
				))}
			</SelectNative>
			{isCalculatorMode ? calculatorInput("h-9 *:h-9!") : amountInput}
			{calculator}
		</div>
	);
}

export function TransactionAmountField(props: Props) {
	const field = useFieldContext<TransactionAmountValue>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<FieldControl>
				<TransactionAmountInput
					value={field.state.value.value}
					currency={field.state.value.currency}
					onValueChange={(v) => field.setValue((s) => ({ ...s, value: v }))}
					onCurrencyChange={(c) => field.setValue((s) => ({ ...s, currency: c }))}
					onBlur={field.handleBlur}
				/>
			</FieldControl>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}

interface SplitProps extends Props {
	/** Omitted for a figure with no direction, like an event's budget. */
	sign?: "expense" | "income";
	onEnter?: () => void;
	inputId?: string;
}

export function TransactionAmountHeroField(props: SplitProps) {
	const field = useFieldContext<TransactionAmountValue>();

	return (
		<Field className="gap-1">
			<FieldControl>
				<TransactionAmountInput
					inputId={props.inputId}
					value={field.state.value.value}
					currency={field.state.value.currency}
					sign={props.sign}
					variant="hero"
					onValueChange={(v) => field.setValue((s) => ({ ...s, value: v }))}
					onCurrencyChange={(c) => field.setValue((s) => ({ ...s, currency: c }))}
					onBlur={field.handleBlur}
					onEnter={props.onEnter}
				/>
			</FieldControl>
			<FieldMessage />
		</Field>
	);
}
