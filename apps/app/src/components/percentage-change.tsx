import { TrendingDownIcon, TrendingUpIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { getPercentageChangeTextClasses, type PercentageChange } from "@/helpers/percentage-change";

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
	const textClasses = getPercentageChangeTextClasses(change);
	const Icon = IconComponent[change.status];

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 font-medium",
				textClasses,
				sizeClasses[size],
				className,
			)}
		>
			{Icon && <Icon className={iconSizeClasses[size]} />}
			{change.displayValue}
			{comparisonText && (
				<Button
					variant="link"
					className="p-0 decoration-dotted"
					onClick={onComparisonClick}
					disabled={!onComparisonClick}
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
				change.status === "increase" && "bg-green-50 dark:bg-green-950/30",
				change.status === "decrease" && "bg-red-50 dark:bg-red-950/30",
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
