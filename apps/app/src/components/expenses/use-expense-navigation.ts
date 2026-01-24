import { useMemo } from "react";

import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";

interface UseExpenseNavigationProps {
	expenses: SyncedExpense[];
	selectedId: string | null;
	onSelectExpense: (id: string | null) => void;
}

export function useExpenseNavigation({
	expenses,
	selectedId,
	onSelectExpense,
}: UseExpenseNavigationProps) {
	const currentIndex = useMemo(
		() => expenses.findIndex((item) => item.id === selectedId),
		[expenses, selectedId],
	);

	const currentExpense = currentIndex >= 0 ? expenses[currentIndex] : undefined;

	const handleGoUp = () => {
		const prevIndex = currentIndex - 1;
		if (prevIndex < 0) return;
		const prevExpense = expenses[prevIndex];
		if (!prevExpense) return;
		onSelectExpense(prevExpense.id);
	};

	const handleGoDown = () => {
		const nextIndex = currentIndex + 1;
		if (nextIndex >= expenses.length) return;
		const nextExpense = expenses[nextIndex];
		if (!nextExpense) return;
		onSelectExpense(nextExpense.id);
	};

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < expenses.length - 1;

	return {
		currentExpense,
		currentIndex,
		handleGoUp,
		handleGoDown,
		canGoUp,
		canGoDown,
	};
}
