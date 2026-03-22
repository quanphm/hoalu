import type { SyncedIncome } from "#app/components/incomes/use-incomes.ts";
import { useMemo } from "react";

interface UseIncomeNavigationProps {
	incomes: SyncedIncome[];
	selectedId: string | null;
	onSelectIncome: (id: string | null) => void;
}

export function useIncomeNavigation({
	incomes,
	selectedId,
	onSelectIncome,
}: UseIncomeNavigationProps) {
	const currentIndex = useMemo(
		() => incomes.findIndex((item) => item.id === selectedId),
		[incomes, selectedId],
	);

	const currentIncome = currentIndex >= 0 ? incomes[currentIndex] : undefined;

	const handleGoUp = () => {
		const prevIndex = currentIndex - 1;
		if (prevIndex < 0) return;
		const prevIncome = incomes[prevIndex];
		if (!prevIncome) return;
		onSelectIncome(prevIncome.id);
	};

	const handleGoDown = () => {
		const nextIndex = currentIndex + 1;
		if (nextIndex >= incomes.length) return;
		const nextIncome = incomes[nextIndex];
		if (!nextIncome) return;
		onSelectIncome(nextIncome.id);
	};

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < incomes.length - 1;

	return {
		currentIncome,
		currentIndex,
		handleGoUp,
		handleGoDown,
		canGoUp,
		canGoDown,
	};
}
