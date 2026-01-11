import { useState } from "react";

import { TrendingDownIcon, TrendingUpIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";

import {
	getPercentageChangeTextClasses,
	type PercentageChange,
} from "#app/helpers/percentage-change.ts";

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

interface PercentageChangeDisplayProps {
	change: PercentageChange;
	className?: string;
	size?: "sm" | "md" | "lg";
	comparisonText?: string;
	onComparisonClick?: () => void;
}

export function PercentageChangeDisplay({
	change,
	className,
	size = "md",
	comparisonText,
	onComparisonClick,
}: PercentageChangeDisplayProps) {
	const [viewMode, setViewMode] = useState<"percent" | "value">("percent");
	const textClasses = getPercentageChangeTextClasses(change);
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
				className={cn("p-0 decoration-dotted", textClasses)}
				onClick={handleViewModeChange}
				title="toggle view percent or absolute value"
			>
				{viewMode === "percent" && change.displayInPercent}
				{viewMode === "value" && change.displayInValue}
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

interface PercentageChangeBadgeProps {
	change: PercentageChange;
	className?: string;
	comparisonText?: string;
	onComparisonClick?: () => void;
}

export function PercentageChangeBadge({
	change,
	className,
	comparisonText,
	onComparisonClick,
}: PercentageChangeBadgeProps) {
	const textClasses = getPercentageChangeTextClasses(change);

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 font-medium text-xs",
				textClasses,
				change.status === "increase" && "bg-red-50 dark:bg-red-950/30",
				change.status === "decrease" && "bg-green-50 dark:bg-green-950/30",
				className,
			)}
		>
			<PercentageChangeDisplay
				change={change}
				size="sm"
				className="text-inherit"
				comparisonText={comparisonText}
				onComparisonClick={onComparisonClick}
			/>
		</span>
	);
}
