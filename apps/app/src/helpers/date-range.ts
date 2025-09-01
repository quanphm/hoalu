import { datetime } from "@hoalu/common/datetime";
import type { PredefinedDateRange } from "@/atoms/filters";

interface DateRangeCalculation {
	startDate: Date;
	endDate: Date;
}

/**
 * Calculate start and end dates for dashboard date ranges
 */
export function calculateDateRange(
	predefinedRange: PredefinedDateRange,
	customRange?: { from: Date; to: Date },
): DateRangeCalculation | null {
	if (predefinedRange === "all") return null;

	let startDate: Date, endDate: Date;

	if (predefinedRange === "custom") {
		if (!customRange) return null;
		startDate = datetime.startOfDay(customRange.from);
		endDate = datetime.endOfDay(customRange.to);
	}
	// Week to date (Monday to today)
	else if (predefinedRange === "wtd") {
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const dayOfWeek = today.getDay();
		const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, Monday is 1
		const monday = new Date(today);
		monday.setDate(monday.getDate() - daysFromMonday);
		startDate = datetime.startOfDay(monday);
	}
	// Month to date (1st of current month to today)
	else if (predefinedRange === "mtd") {
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		startDate = datetime.startOfDay(firstOfMonth);
	}
	// Year to date (Jan 1 to today)
	else if (predefinedRange === "ytd") {
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const startOfYear = new Date(today.getFullYear(), 0, 1);
		startDate = datetime.startOfDay(startOfYear);
	}
	// Last N days
	else {
		const days = parseInt(predefinedRange, 10);
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const cutoffDate = new Date(today);
		cutoffDate.setDate(cutoffDate.getDate() - days + 1);
		startDate = datetime.startOfDay(cutoffDate);
	}

	return { startDate, endDate };
}

export function filterDataByRange<T extends { date: string }>(
	data: T[],
	range: PredefinedDateRange,
	customRange?: { from: Date; to: Date },
): T[] {
	const dateRange = calculateDateRange(range, customRange);
	if (!dateRange) {
		return data;
	}
	const { startDate, endDate } = dateRange;

	const filtered = data
		.filter((item) => {
			const itemDate = datetime.parse(item.date, "yyyy-MM-dd", new Date());
			return itemDate >= startDate && itemDate <= endDate;
		})
		.sort((a, b) => a.date.localeCompare(b.date));

	return filtered;
}
