import { datetime } from "@hoalu/common/datetime";
import type { DashboardDateRange } from "@/atoms/filters";

interface DateRangeCalculation {
	startDate: Date;
	endDate: Date;
}

/**
 * Calculate start and end dates for dashboard date ranges
 */
function calculateDateRange(
	range: DashboardDateRange,
	customRange?: { from: Date; to: Date },
): DateRangeCalculation | null {
	if (range === "all") {
		return null;
	}

	let startDate: Date, endDate: Date;

	if (range === "custom" && customRange) {
		startDate = datetime.startOfDay(customRange.from);
		endDate = datetime.endOfDay(customRange.to);
	} else if (range === "wtd") {
		// Week to date (Monday to today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const dayOfWeek = today.getDay();
		const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, Monday is 1
		const monday = new Date(today);
		monday.setDate(monday.getDate() - daysFromMonday);
		startDate = datetime.startOfDay(monday);
	} else if (range === "mtd") {
		// Month to date (1st of current month to today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		startDate = datetime.startOfDay(firstOfMonth);
	} else if (range === "ytd") {
		// Year to date (Jan 1 to today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const startOfYear = new Date(today.getFullYear(), 0, 1);
		startDate = datetime.startOfDay(startOfYear);
	} else {
		// Last N days
		const days = parseInt(range, 10);
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const cutoffDate = new Date(today);
		cutoffDate.setDate(cutoffDate.getDate() - days + 1);
		startDate = datetime.startOfDay(cutoffDate);
	}

	return { startDate, endDate };
}

/**
 * Filter data array by date range
 */
export function filterDataByRange<T extends { date: string }>(
	data: T[],
	range: DashboardDateRange,
	customRange?: { from: Date; to: Date },
): T[] {
	const dateRange = calculateDateRange(range, customRange);

	if (!dateRange) {
		return data;
	}

	const { startDate, endDate } = dateRange;

	// Sort data by date first to ensure proper ordering
	const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

	const filtered = sortedData.filter((item) => {
		const itemDate = datetime.parse(item.date, "yyyy-MM-dd", new Date());
		return itemDate >= startDate && itemDate <= endDate;
	});

	return filtered;
}
