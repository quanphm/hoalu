import { TrendingDownIcon, TrendingUpIcon } from "@hoalu/icons/tabler";
import { cn } from "@hoalu/ui/utils";
import { getPercentageChangeClasses, type PercentageChange } from "@/helpers/percentage-change";

interface PercentageChangeDisplayProps {
	change: PercentageChange;
	className?: string;
	size?: "sm" | "md" | "lg";
	comparisonText?: string;
}

export function PercentageChangeDisplay({
	change,
	className,
	size = "md",
	comparisonText,
}: PercentageChangeDisplayProps) {
	const classes = getPercentageChangeClasses(change);

	const sizeClasses = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-base",
	};

	const iconSizeClasses = {
		sm: "h-3 w-3",
		md: "h-4 w-4",
		lg: "h-5 w-5",
	};

	const IconComponent = change.isNoChange
		? null
		: change.isIncrease
			? TrendingUpIcon
			: TrendingDownIcon;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 font-medium",
				classes,
				sizeClasses[size],
				className,
			)}
		>
			{IconComponent && <IconComponent className={iconSizeClasses[size]} />}
			{change.displayValue}
			{comparisonText && (
				<span className="font-normal text-muted-foreground">{comparisonText}</span>
			)}
		</span>
	);
}

interface PercentageChangeBadgeProps {
	change: PercentageChange;
	className?: string;
	comparisonText?: string;
}

export function PercentageChangeBadge({
	change,
	className,
	comparisonText,
}: PercentageChangeBadgeProps) {
	const classes = getPercentageChangeClasses(change);

	let bgClasses = "bg-muted/50";
	if (change.isIncrease) {
		bgClasses = "bg-green-50 dark:bg-green-950/30";
	} else if (change.isDecrease) {
		bgClasses = "bg-red-50 dark:bg-red-950/30";
	}

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-xs",
				classes,
				bgClasses,
				className,
			)}
		>
			<PercentageChangeDisplay
				change={change}
				size="sm"
				className="text-inherit"
				comparisonText={comparisonText}
			/>
		</span>
	);
}
