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

export function CurrencyValue({ as: Component = "span", ...props }: CurrencyValueProps) {
	const formattedValue = formatCurrency(props.value, props.currency, {
		style: props.style || "currency",
	});

	if (props?.style === "decimal") {
		return (
			<div
				className={cn("font-geist-mono font-semibold text-base tracking-tight", props.className)}
			>
				{formattedValue}
				<span className="ml-1 font-normal text-muted-foreground">{props.currency}</span>
			</div>
		);
	}

	const content = props.prefix ? `${props.prefix} ${formattedValue}` : formattedValue;

	return (
		<Component className={cn("font-geist-mono text-base tracking-tight", props.className)}>
			{content}
		</Component>
	);
}
