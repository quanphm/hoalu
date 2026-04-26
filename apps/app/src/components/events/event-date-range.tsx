import { datetime } from "@hoalu/common/datetime";
import { cn } from "@hoalu/ui/utils";

interface EventDateRangeProps {
	startDate: string | null | undefined;
	endDate: string | null | undefined;
	format?: string;
	className?: string;
}

function formatDate(dateStr: string, format: string): string {
	try {
		return datetime.format(new Date(dateStr), format);
	} catch {
		return dateStr;
	}
}

export function EventDateRange({ startDate, endDate, format = "dd/MM/yyyy" }: EventDateRangeProps) {
	if (!startDate && !endDate) return null;

	let label: React.ReactNode;

	if (startDate && endDate) {
		if (startDate === endDate) {
			label = formatDate(startDate, format);
		} else {
			label = (
				<>
					{formatDate(startDate, format)} {" - "} {formatDate(endDate, format)}
				</>
			);
		}
	} else if (startDate) {
		label = <>From {formatDate(startDate, format)}</>;
	} else {
		label = <>Until {formatDate(endDate!, format)}</>;
	}

	return <div className="text-muted-foreground flex items-center text-sm">{label}</div>;
}

export function EventDateRangeColumn({
	startDate,
	endDate,
	format = "dd/MM/yyyy",
	className,
}: EventDateRangeProps) {
	return (
		<>
			<div className={cn("flex items-center px-4 py-3 text-sm", className)}>
				{startDate ? formatDate(startDate, format) : "-"}
			</div>
			<div className={cn("flex items-center px-4 py-3 text-sm", className)}>
				{endDate ? formatDate(endDate, format) : "-"}
			</div>
		</>
	);
}
