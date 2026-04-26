import { ExpenseDetails, MobileExpenseDetails } from "#app/components/expenses/expense-details.tsx";
import { useFilteredExpenses } from "#app/components/expenses/use-expenses.ts";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffectEvent, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const Route = createFileRoute("/_dashboard/$slug/transactions/$transactionId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { transactionId } = Route.useParams();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const { shouldUseMobileLayout } = useLayoutMode();
	const filtered = useFilteredExpenses();

	const filteredRef = useRef(filtered);
	filteredRef.current = filtered;
	const slugRef = useRef(slug);
	slugRef.current = slug;

	const currentIndex = filtered.findIndex((e) => e.public_id === transactionId);
	const currentExpense = currentIndex >= 0 ? filtered[currentIndex] : undefined;

	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const pendingRef = useRef<"up" | "down" | null>(null);

	const flushNav = useEffectEvent(() => {
		const f = filteredRef.current;
		const s = slugRef.current;
		const idx = f.findIndex((e) => e.public_id === transactionId);
		if (idx < 0) return;

		const targetIdx = pendingRef.current === "down" ? idx + 1 : idx - 1;
		const target = f[targetIdx];
		if (!target) return;

		navigate({
			to: "/$slug/transactions/$transactionId",
			params: { slug: s, transactionId: target.public_id },
			replace: true,
		});
		pendingRef.current = null;
	});

	const debouncedNav = useEffectEvent((direction: "up" | "down") => {
		pendingRef.current = direction;
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(flushNav, 60);
	});

	const handleGoUp = useCallback(() => debouncedNav("up"), []);
	const handleGoDown = useCallback(() => debouncedNav("down"), []);

	const handleClose = useCallback(() => {
		navigate({ to: "/$slug/transactions", params: { slug } });
	}, [navigate, slug]);

	useHotkeys("j", handleGoDown, [handleGoDown]);
	useHotkeys("k", handleGoUp, [handleGoUp]);
	useHotkeys("esc", handleClose, [handleClose]);

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < filtered.length - 1;

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
