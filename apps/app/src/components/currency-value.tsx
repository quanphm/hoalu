import { formatCurrency } from "#app/helpers/currency.ts";
import { cn } from "@hoalu/ui/utils";

interface CurrencyValueProps {
	value: number;
	currency: string;
	prefix?: string;
	style?: Intl.NumberFormatOptions["style"];
	className?: string;
	as?: "span" | "p";
}

export function CurrencyValue({
	as: Component = "span",
	style = "currency",
	...props
}: CurrencyValueProps) {
	const formattedValue = formatCurrency(props.value, props.currency, { style });

	if (style === "decimal") {
		return (
			<Component
				className={cn(
					"font-geist-mono text-foreground text-base font-semibold tracking-tight",
					props.className,
				)}
			>
				{formattedValue}
				<span className="text-muted-foreground ml-1 font-normal">{props.currency}</span>
			</Component>
		);
	}

	const content = props.prefix ? `${props.prefix} ${formattedValue}` : formattedValue;

	return (
		<Component
			className={cn("font-geist-mono text-foreground text-base tracking-tight", props.className)}
		>
			{content}
		</Component>
	);
}
