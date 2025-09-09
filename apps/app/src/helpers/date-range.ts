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
	customRange?: { from: Date; to: Date } | null,
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

/**
 * Check if a custom date range represents a full month
 */
function isCustomRangeFullMonth(startDate: Date, endDate: Date): boolean {
	// Check if start is the first day of a month
	const isStartFirstOfMonth = startDate.getDate() === 1;

	// Check if end is the last day of a month
	const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
	const isEndLastOfMonth = endDate.getDate() === lastDayOfMonth.getDate();

	// Check if they're in the same month
	const isSameMonth =
		startDate.getMonth() === endDate.getMonth() &&
		startDate.getFullYear() === endDate.getFullYear();

	return isStartFirstOfMonth && isEndLastOfMonth && isSameMonth;
}

/**
 * Calculate the comparison/previous period date range for percentage change calculations
 */
export function calculateComparisonDateRange(
	predefinedRange: PredefinedDateRange,
	customRange?: { from: Date; to: Date } | null,
): DateRangeCalculation | null {
	if (predefinedRange === "all") return null;

	const currentRange = calculateDateRange(predefinedRange, customRange);
	if (!currentRange) return null;

	const { startDate: currentStart, endDate: currentEnd } = currentRange;

	// Calculate the duration of current period in milliseconds
	const durationMs = currentEnd.getTime() - currentStart.getTime();

	let previousStart: Date, previousEnd: Date;

	if (predefinedRange === "custom") {
		// Check if custom range represents a full month
		const isFullMonth = isCustomRangeFullMonth(currentStart, currentEnd);

		if (isFullMonth) {
			// Compare to previous full month
			const currentMonth = new Date(currentStart.getFullYear(), currentStart.getMonth(), 1);
			const prevMonth = new Date(currentMonth);
			prevMonth.setMonth(prevMonth.getMonth() - 1);

			previousStart = datetime.startOfDay(prevMonth);
			previousEnd = datetime.endOfDay(
				new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0),
			);
		} else {
			// For custom ranges, go back by the same duration
			previousEnd = new Date(currentStart.getTime() - 1000 * 60 * 60 * 24); // Day before current start
			previousStart = new Date(previousEnd.getTime() - durationMs);
		}
	}
	// For period-to-date comparisons, use same period from previous timeframe
	else if (predefinedRange === "wtd") {
		// Previous week same period
		const prevWeekEnd = new Date(currentEnd);
		prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
		const prevWeekStart = new Date(currentStart);
		prevWeekStart.setDate(prevWeekStart.getDate() - 7);
		previousStart = datetime.startOfDay(prevWeekStart);
		previousEnd = datetime.endOfDay(prevWeekEnd);
	} else if (predefinedRange === "mtd") {
		// Previous month same period (1st to same day of month)
		const prevMonth = new Date(currentEnd);
		prevMonth.setMonth(prevMonth.getMonth() - 1);

		// Handle cases where previous month has fewer days
		const currentDay = currentEnd.getDate();
		const prevMonthLastDay = new Date(
			prevMonth.getFullYear(),
			prevMonth.getMonth() + 1,
			0,
		).getDate();
		const adjustedDay = Math.min(currentDay, prevMonthLastDay);

		prevMonth.setDate(adjustedDay);

		previousEnd = datetime.endOfDay(prevMonth);
		previousStart = datetime.startOfDay(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1));
	} else if (predefinedRange === "ytd") {
		// Previous year same period (Jan 1 to same date)
		const prevYear = new Date(currentEnd);
		prevYear.setFullYear(prevYear.getFullYear() - 1);

		// Handle leap year edge case for Feb 29
		if (currentEnd.getMonth() === 1 && currentEnd.getDate() === 29) {
			prevYear.setDate(28); // Feb 28 in non-leap year
		}

		previousEnd = datetime.endOfDay(prevYear);
		previousStart = datetime.startOfDay(new Date(prevYear.getFullYear(), 0, 1));
	}
	// For last N days, go back by the same number of days
	else {
		const days = parseInt(predefinedRange, 10);
		previousEnd = new Date(currentStart.getTime() - 1000 * 60 * 60 * 24); // Day before current start
		previousStart = new Date(previousEnd.getTime() - (days - 1) * 1000 * 60 * 60 * 24);
		previousStart = datetime.startOfDay(previousStart);
		previousEnd = datetime.endOfDay(previousEnd);
	}

	return {
		startDate: previousStart,
		endDate: previousEnd,
	};
}

export function filterDataByRange<T extends { date: string }>(
	data: T[],
	range: PredefinedDateRange,
	customRange?: { from: Date; to: Date } | null,
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

/**
 * Get a human-readable description of the comparison period
 */
export function getComparisonPeriodText(
	predefinedRange: PredefinedDateRange,
	customRange?: { from: Date; to: Date } | null,
): string | null {
	if (predefinedRange === "all") return null;

	const comparisonRange = calculateComparisonDateRange(predefinedRange, customRange);
	if (!comparisonRange) return null;

	const { startDate, endDate } = comparisonRange;

	if (predefinedRange === "custom" && customRange) {
		// Check if the original custom range was a full month
		const currentRange = calculateDateRange(predefinedRange, customRange);
		if (currentRange) {
			const isFullMonth = isCustomRangeFullMonth(currentRange.startDate, currentRange.endDate);

			if (isFullMonth) {
				// For full month comparisons, show month name
				const monthName = datetime.format(startDate, "MMMM yyyy");
				return `vs ${monthName}`;
			}
		}

		// For other custom ranges, show the exact dates
		const start = datetime.format(startDate, "MMM d");
		const end = datetime.format(endDate, "MMM d, yyyy");
		return `vs ${start} - ${end}`;
	}
	// For period-to-date comparisons
	else if (predefinedRange === "wtd") {
		// Previous week same period
		const start = datetime.format(startDate, "MMM d");
		const end = datetime.format(endDate, "MMM d, yyyy");
		return `vs ${start} - ${end}`;
	} else if (predefinedRange === "mtd") {
		// Previous month same period
		const monthName = datetime.format(startDate, "MMMM yyyy");
		return `vs ${monthName}`;
	} else if (predefinedRange === "ytd") {
		// Previous year same period
		const year = datetime.format(startDate, "yyyy");
		return `vs ${year}`;
	}
	// For last N days
	else {
		const start = datetime.format(startDate, "MMM d");
		const end = datetime.format(endDate, "MMM d, yyyy");
		return `vs ${start} - ${end}`;
	}
}
