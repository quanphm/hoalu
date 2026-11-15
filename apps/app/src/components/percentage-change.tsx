import { TrendDownIcon, TrendUpIcon, type Icon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@hoalu/ui/popover";
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";

import { amountViewMode$, type AmountViewMode } from "#app/atoms/amount-view.ts";
import { formatDateRange } from "#app/helpers/format-date.ts";
import { trendChangeVariants, type PercentageChange } from "#app/helpers/percentage-change.ts";

import { CurrencyValue } from "./currency-value";

const IconComponent: Record<PercentageChange["status"], Icon | null> = {
	"no-change": null,
	increase: TrendUpIcon,
	decrease: TrendDownIcon,
};

const sizeClasses = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const iconSizeClasses = {
	sm: "size-3",
	md: "size-3.5",
	lg: "size-4.5",
};

/** The period a delta is measured against. */
export interface ComparisonPeriod {
	startDate: Date;
	endDate: Date;
}

interface PercentageChangeProps {
	change: PercentageChange;
	invertColor?: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
	comparison?: ComparisonPeriod | null;
	/** Jumping is an explicit action inside that popover. */
	onJumpToPeriod?: () => void;
}

const MODE_LABEL: Record<AmountViewMode, string> = {
	percent: "percentage",
	value: "amount",
};

export function PercentageChangeDisplay({
	change,
	invertColor = false,
	className,
	size = "md",
	comparison,
	onJumpToPeriod,
}: PercentageChangeProps) {
	const viewMode = useValue(amountViewMode$);
	const textClasses = trendChangeVariants({
		trend: change.status,
		invert: invertColor,
	});
	const Icon = IconComponent[change.status];
	const nextMode = viewMode === "percent" ? "value" : "percent";
	// Not `text-[inherit]`: tailwind-merge reads that as a colour, so the Button's
	// `text-xs` and CurrencyValue's `text-base` would survive and win the cascade.
	const fontSize = sizeClasses[size];

	return (
		<span className={cn("inline-flex items-center gap-1 font-medium", fontSize, className)}>
			{Icon && <Icon className={cn(textClasses, iconSizeClasses[size])} />}
			<Button
				variant="link"
				size="xs"
				className={cn("-mx-1 h-6 px-1 no-underline hover:underline", fontSize, textClasses)}
				onClick={() => amountViewMode$.set(nextMode)}
				aria-label={`Show as ${MODE_LABEL[nextMode]}`}
				title={`Show as ${MODE_LABEL[nextMode]}`}
			>
				{viewMode === "percent" ? (
					<span className="tracking-tight tabular-nums">{change.displayInPercent}</span>
				) : (
					<CurrencyValue
						value={change.displayInValue}
						currency={change.currency}
						className={cn(fontSize, textClasses)}
						prefix={
							change.status === "increase" ? "+" : change.status === "decrease" ? "-" : undefined
						}
					/>
				)}
			</Button>
			{comparison && (
				<Popover>
					<PopoverTrigger
						render={
							<Button
								variant="link"
								size="xs"
								className={cn(
									"text-muted-foreground -mx-1 h-6 px-1 font-normal no-underline decoration-dotted hover:underline",
									fontSize,
								)}
								aria-label={`Compared to ${formatDateRange(comparison.startDate, comparison.endDate)}`}
							/>
						}
					>
						vs {formatDateRange(comparison.startDate, comparison.endDate)}
					</PopoverTrigger>
					<PopoverContent className="w-64" align="start">
						<PopoverTitle className="text-sm font-medium">Compared against</PopoverTitle>
						<PopoverDescription className="text-muted-foreground mt-1 text-xs">
							{formatDateRange(comparison.startDate, comparison.endDate)}
						</PopoverDescription>
						{onJumpToPeriod && (
							<Button variant="outline" size="sm" className="mt-3 w-full" onClick={onJumpToPeriod}>
								Show that period
							</Button>
						)}
					</PopoverContent>
				</Popover>
			)}
		</span>
	);
}
