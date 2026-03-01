import type { SyncedRecurringBill } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { useMemo } from "react";

interface UseRecurringBillNavigationProps {
	bills: SyncedRecurringBill[];
	selectedId: string | null;
	onSelectBill: (id: string | null) => void;
}

export function useRecurringBillNavigation({
	bills,
	selectedId,
	onSelectBill,
}: UseRecurringBillNavigationProps) {
	const currentIndex = useMemo(
		() => bills.findIndex((b) => b.id === selectedId),
		[bills, selectedId],
	);

	const currentBill = currentIndex >= 0 ? bills[currentIndex] : undefined;

	const handleGoUp = () => {
		const prevIndex = currentIndex - 1;
		if (prevIndex < 0) return;
		const prev = bills[prevIndex];
		if (!prev) return;
		onSelectBill(prev.id);
	};

	const handleGoDown = () => {
		const nextIndex = currentIndex + 1;
		if (nextIndex >= bills.length) return;
		const next = bills[nextIndex];
		if (!next) return;
		onSelectBill(next.id);
	};

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < bills.length - 1;

	return {
		currentBill,
		currentIndex,
		handleGoUp,
		handleGoDown,
		canGoUp,
		canGoDown,
	};
}
