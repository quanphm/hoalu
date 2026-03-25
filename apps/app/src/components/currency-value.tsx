import { redactedAmountAtom } from "#app/atoms/redacted.ts";
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

const DEFAULT_CLASSNAME = "font-geist-mono text-foreground text-base tracking-tight tabular-nums";
const REDACTED_FONT = "'Redacted Script', sans-serif";

export function CurrencyValue({
	as: Component = "span",
	style = "currency",
	...props
}: CurrencyValueProps) {
	const isRedacted = useAtomValue(redactedAmountAtom);
	const formattedValue = formatCurrency(props.value, props.currency, { style });

	if (style === "decimal") {
		return (
			<Component className={cn(DEFAULT_CLASSNAME, props.className)}>
				{isRedacted ? (
					<span style={{ fontFamily: REDACTED_FONT }}>{formattedValue} {props.currency}</span>
				) : (
					<>
						{formattedValue}
						<span className="text-muted-foreground ml-1 font-normal">{props.currency}</span>
					</>
				)}
			</Component>
		);
	}

	const content = props.prefix ? `${props.prefix} ${formattedValue}` : formattedValue;

	return (
		<Component className={cn(DEFAULT_CLASSNAME, props.className)}>
			{isRedacted ? (
				<span style={{ fontFamily: REDACTED_FONT }}>{content}</span>
			) : (
				content
			)}
		</Component>
	);
}
