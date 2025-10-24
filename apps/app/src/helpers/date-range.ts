import { datetime, TIME_IN_MILLISECONDS } from "@hoalu/common/datetime";

import type { PredefinedDateRange } from "#app/atoms/filters.ts";

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

function isRangeFullMonth(startDate: Date, endDate: Date): boolean {
	const isStartFirstOfMonth = startDate.getDate() === 1;
	const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
	const isEndLastOfMonth = endDate.getDate() === lastDayOfMonth.getDate();
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
		const isFullMonth = isRangeFullMonth(currentStart, currentEnd);

		if (isFullMonth) {
			// Compare to previous month
			const currentMonth = new Date(currentStart.getFullYear(), currentStart.getMonth(), 1);
			const prevMonth = new Date(currentMonth);
			prevMonth.setMonth(prevMonth.getMonth() - 1);

			previousStart = datetime.startOfDay(prevMonth);
			previousEnd = datetime.endOfDay(
				new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0),
			);
		} else {
			// go back by the same duration
			previousEnd = new Date(currentStart.getTime() - TIME_IN_MILLISECONDS.DAY); // Day before current start
			previousStart = new Date(previousEnd.getTime() - durationMs);

			// Normalize to full-day boundaries for consistency
			previousStart = datetime.startOfDay(previousStart);
			previousEnd = datetime.endOfDay(previousEnd);
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
		previousEnd = new Date(currentStart.getTime() - TIME_IN_MILLISECONDS.DAY); // Day before current start
		previousStart = new Date(previousEnd.getTime() - (days - 1) * TIME_IN_MILLISECONDS.DAY);
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

export function getComparisonPeriodText(
	predefinedRange: PredefinedDateRange,
	customRange?: { from: Date; to: Date } | null,
): string | null {
	if (predefinedRange === "all") return null;

	const comparisonRange = calculateComparisonDateRange(predefinedRange, customRange);
	if (!comparisonRange) return null;

	const { startDate, endDate } = comparisonRange;

	if (predefinedRange === "custom" && customRange) {
		const currentRange = calculateDateRange(predefinedRange, customRange);
		if (currentRange) {
			const isFullMonth = isRangeFullMonth(currentRange.startDate, currentRange.endDate);
			if (isFullMonth) {
				const monthName = datetime.format(startDate, "MMMM yyyy");
				return `vs ${monthName}`;
			}
		}
		const start = datetime.format(startDate, "MMM d, yyyy");
		const end = datetime.format(endDate, "MMM d, yyyy");
		return `vs ${start} - ${end}`;
	} else if (predefinedRange === "ytd") {
		const year = datetime.format(startDate, "yyyy");
		return `vs ${year}`;
	} else {
		const start = datetime.format(startDate, "MMM d, yyyy");
		const end = datetime.format(endDate, "MMM d, yyyy");
		return `vs ${start} - ${end}`;
	}
}

/**
 * Generate daily data with zeros for missing dates
 */
export function generateDailyDataWithZeros(data: { date: string; value: number }[], days: number) {
	const today = new Date();
	const dailyData: Record<string, number> = {};

	// Initialize all days in range with zero
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateKey = datetime.format(date, "yyyy-MM-dd");
		dailyData[dateKey] = 0;
	}

	// Fill in actual data
	for (const item of data) {
		if (dailyData[item.date] !== undefined) {
			dailyData[item.date] = item.value;
		}
	}

	return Object.entries(dailyData)
		.map(([date, value]) => ({ date, value }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate daily data for month-to-date
 */
export function generateMTDDataWithZeros(data: { date: string; value: number }[]) {
	const today = new Date();
	const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const dailyData: Record<string, number> = {};

	// Initialize all days from 1st of month to today with zero
	const currentDate = new Date(firstOfMonth);
	while (currentDate <= today) {
		const dateKey = datetime.format(currentDate, "yyyy-MM-dd");
		dailyData[dateKey] = 0;
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Fill in actual data
	for (const item of data) {
		if (dailyData[item.date] !== undefined) {
			dailyData[item.date] = item.value;
		}
	}

	return Object.entries(dailyData)
		.map(([date, value]) => ({ date, value }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

export function getStartOfWeek(date: Date, weekStartsOn: number = 1) {
	const day = date.getDay();
	const diff = day < weekStartsOn ? day + 7 - weekStartsOn : day - weekStartsOn;
	const startOfWeek = new Date(date);
	startOfWeek.setDate(date.getDate() - diff);
	return datetime.startOfDay(startOfWeek);
}

export function generateDailyDataForRange(
	data: { date: string; value: number }[],
	startDate: Date,
	endDate: Date,
): { date: string; value: number }[] {
	const dailyData: Record<string, number> = {};

	// Initialize all days in range with zero
	const currentDate = new Date(datetime.startOfDay(startDate));
	const normalizedEndDate = datetime.endOfDay(endDate);

	while (currentDate <= normalizedEndDate) {
		const dateKey = datetime.format(currentDate, "yyyy-MM-dd");
		dailyData[dateKey] = 0;
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Fill in actual data
	for (const item of data) {
		if (dailyData[item.date] !== undefined) {
			dailyData[item.date] = item.value;
		}
	}

	return Object.entries(dailyData)
		.map(([date, value]) => ({ date, value }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

export function groupDataByMonth(data: { date: string; value: number }[], isYTD = false) {
	const monthlyData: Record<string, number> = {};
	const today = new Date();

	if (isYTD) {
		// For YTD, initialize from January to current month
		const currentMonth = today.getMonth();
		for (let i = 0; i <= currentMonth; i++) {
			const monthDate = new Date(today.getFullYear(), i, 1);
			const monthKey = datetime.format(monthDate, "yyyy-MM");
			monthlyData[monthKey] = 0;
		}
	} else {
		// For "All time", initialize all 12 months (12 months from today backwards)
		for (let i = 11; i >= 0; i--) {
			const monthDate = new Date(today);
			monthDate.setMonth(monthDate.getMonth() - i);
			const monthKey = datetime.format(monthDate, "yyyy-MM");
			monthlyData[monthKey] = 0;
		}
	}

	// Aggregate actual data by month
	for (const item of data) {
		const date = datetime.parse(item.date, "yyyy-MM-dd", new Date());
		const monthKey = datetime.format(date, "yyyy-MM");

		if (monthlyData[monthKey] !== undefined) {
			monthlyData[monthKey] += item.value;
		}
	}

	return Object.entries(monthlyData)
		.map(([monthKey, value]) => ({
			date: `${monthKey}-01`,
			value,
			isMonthly: true, // Flag to identify monthly data
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}
