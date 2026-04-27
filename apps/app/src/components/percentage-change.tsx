import { trendChangeVariants, type PercentageChange } from "#app/helpers/percentage-change.ts";
import { TrendingDownIcon, TrendingUpIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useState } from "react";

import { CurrencyValue } from "./currency-value";

const IconComponent: Record<
	PercentageChange["status"],
	React.ComponentType<React.SVGProps<SVGSVGElement>> | null
> = {
	"no-change": null,
	increase: TrendingUpIcon,
	decrease: TrendingDownIcon,
};

const sizeClasses = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const iconSizeClasses = {
	sm: "size-3",
	md: "size-4",
	lg: "size-5",
};

interface PercentageChangeProps {
	change: PercentageChange;
	invertColor?: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
	comparisonText?: string;
	onComparisonClick?: () => void;
}

export function PercentageChangeDisplay({
	change,
	invertColor = false,
	className,
	size = "md",
	comparisonText,
	onComparisonClick,
}: PercentageChangeProps) {
	const [viewMode, setViewMode] = useState<"percent" | "value">("percent");
	const textClasses = trendChangeVariants({
		trend: change.status,
		invert: invertColor,
	});
	const Icon = IconComponent[change.status];

	function handleViewModeChange() {
		setViewMode((prev) => (prev === "percent" ? "value" : "percent"));
	}

	return (
		<span
			className={cn("inline-flex items-center gap-1 font-medium", sizeClasses[size], className)}
		>
			{Icon && <Icon className={cn(textClasses, iconSizeClasses[size])} />}
			<Button
				variant="link"
				className={cn("p-0 text-right decoration-dotted", textClasses)}
				onClick={handleViewModeChange}
				title="toggle view percent or absolute value"
			>
				{viewMode === "percent" && (
					<span className="font-mono tracking-tight tabular-nums">{change.displayInPercent}</span>
				)}
				{viewMode === "value" && (
					<CurrencyValue
						value={change.displayInValue}
						currency={change.currency}
						className={cn(textClasses, sizeClasses[size])}
						prefix={
							change.status === "increase" ? "+" : change.status === "decrease" ? "-" : undefined
						}
					/>
				)}
			</Button>
			{comparisonText && (
				<Button
					variant="link"
					className="p-0 decoration-dotted"
					onClick={onComparisonClick}
					disabled={!onComparisonClick}
					title="see all expenses"
				>
					{comparisonText}
				</Button>
			)}
		</span>
	);
}
