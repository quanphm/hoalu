import { redactedAmountAtom } from "#app/atoms/index.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { cn } from "@hoalu/ui/utils";
import { useAtomValue } from "jotai";

interface CurrencyValueProps {
	value: number;
	currency: string;
	prefix?: string;
	style?: Intl.NumberFormatOptions["style"];
	className?: string;
	as?: "span" | "p";
}

const DEFAULT_CLASSNAME = "font-mono text-foreground text-base tracking-tight tabular-nums";

export function CurrencyValue({
	as: Component = "span",
	style = "currency",
	...props
}: CurrencyValueProps) {
	const isRedacted = useAtomValue(redactedAmountAtom);

	if (isRedacted) {
		return (
			<Component className={cn(DEFAULT_CLASSNAME, "font-redacted-script", props.className)}>
				{props.value}
			</Component>
		);
	}

	const formattedValue = formatCurrency(props.value, props.currency, { style });

	if (style === "decimal") {
		return (
			<Component className={cn(DEFAULT_CLASSNAME, props.className)}>
				{formattedValue}
				<span className="text-muted-foreground text-2xs ml-1 font-normal tracking-wider">
					{props.currency}
				</span>
			</Component>
		);
	}

	const content = props.prefix ? `${props.prefix}${formattedValue}` : formattedValue;

	return <Component className={cn(DEFAULT_CLASSNAME, props.className)}>{content}</Component>;
}
