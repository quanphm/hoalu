import { ExpenseDetails, MobileExpenseDetails } from "#app/components/expenses/expense-details.tsx";
import { useFilteredExpenses } from "#app/components/expenses/use-expenses.ts";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const Route = createFileRoute("/_dashboard/$slug/expenses/$expenseId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { expenseId } = Route.useParams();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const { shouldUseMobileLayout } = useLayoutMode();
	const filtered = useFilteredExpenses();

	const currentIndex = filtered.findIndex((e) => e.public_id === expenseId);
	const currentExpense = currentIndex >= 0 ? filtered[currentIndex] : undefined;

	const resolveExpenseId = useCallback(
		(expense: (typeof filtered)[number]) => expense.public_id,
		[],
	);

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < filtered.length - 1;

	const handleGoUp = useCallback(() => {
		const prev = filtered[currentIndex - 1];
		if (!prev) return;
		navigate({
			to: "/$slug/expenses/$expenseId",
			params: { slug, expenseId: resolveExpenseId(prev) },
		});
	}, [currentIndex, filtered, navigate, slug, resolveExpenseId]);

	const handleGoDown = useCallback(() => {
		const next = filtered[currentIndex + 1];
		if (!next) return;
		navigate({
			to: "/$slug/expenses/$expenseId",
			params: { slug, expenseId: resolveExpenseId(next) },
		});
	}, [currentIndex, filtered, navigate, slug, resolveExpenseId]);

	const handleClose = useCallback(() => {
		navigate({ to: "/$slug/expenses", params: { slug } });
	}, [navigate, slug]);

	useHotkeys("j", handleGoDown, [handleGoDown]);
	useHotkeys("k", handleGoUp, [handleGoUp]);
	useHotkeys("esc", handleClose, [handleClose]);

	if (!currentExpense) {
		return null;
	}

	if (shouldUseMobileLayout) {
		return (
			<MobileExpenseDetails
				currentExpense={currentExpense}
				onClose={handleClose}
				onGoUp={handleGoUp}
				onGoDown={handleGoDown}
				canGoUp={canGoUp}
				canGoDown={canGoDown}
			/>
		);
	}

	return (
		<ExpenseDetails
			currentExpense={currentExpense}
			onClose={handleClose}
			onGoUp={handleGoUp}
			onGoDown={handleGoDown}
			canGoUp={canGoUp}
			canGoDown={canGoDown}
		/>
	);
}
