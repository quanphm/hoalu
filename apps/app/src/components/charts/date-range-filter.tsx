import { useAtom } from "jotai";

import { Tabs, TabsList, TabsTrigger } from "@hoalu/ui/tabs";
import { type DateRangeFilter, dateRangeFilterAtom } from "@/atoms";

interface DateRangeFilterProps {
	className?: string;
}

export function DateRangeFilter({ className }: DateRangeFilterProps) {
	const [dateRange, setDateRange] = useAtom(dateRangeFilterAtom);

	const handleValueChange = (value: string) => {
		setDateRange(value as DateRangeFilter);
	};

	return (
		<Tabs value={dateRange} onValueChange={handleValueChange} className={className}>
			<TabsList>
				<TabsTrigger value="7d">7 days</TabsTrigger>
				<TabsTrigger value="30d">30 days</TabsTrigger>
				<TabsTrigger value="all">All time</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
