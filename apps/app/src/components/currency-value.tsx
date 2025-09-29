import { cn } from "@hoalu/ui/utils";
import { formatCurrency } from "@/helpers/currency";

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
					"font-geist-mono font-semibold text-base text-foreground tracking-tight",
					props.className,
				)}
			>
				{formattedValue}
				<span className="ml-1 font-normal text-muted-foreground">{props.currency}</span>
			</Component>
		);
	}

	const content = props.prefix ? `${props.prefix} ${formattedValue}` : formattedValue;

	return (
		<Component
			className={cn("font-geist-mono text-base text-foreground tracking-tight", props.className)}
		>
			{content}
		</Component>
	);
}
