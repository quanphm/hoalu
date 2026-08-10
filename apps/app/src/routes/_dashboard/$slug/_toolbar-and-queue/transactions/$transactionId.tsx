import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffectEvent, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { EditExpenseForm } from "#app/components/transactions/expense-form.tsx";
import { EditIncomeForm } from "#app/components/transactions/income-form.tsx";
import { useFilteredTransactions } from "#app/components/transactions/use-transactions.ts";

export const Route = createFileRoute(
	"/_dashboard/$slug/_toolbar-and-queue/transactions/$transactionId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { transactionId } = Route.useParams();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const filtered = useFilteredTransactions();

	const filteredRef = useRef(filtered);
	filteredRef.current = filtered;
	const slugRef = useRef(slug);
	slugRef.current = slug;

	const currentIndex = filtered.findIndex((e) => e.public_id === transactionId);
	const current = currentIndex >= 0 ? filtered[currentIndex] : undefined;

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

	if (!current) return null;

	const navigation = {
		onClose: handleClose,
		onGoUp: handleGoUp,
		onGoDown: handleGoDown,
		canGoUp,
		canGoDown,
	};

	if (current.kind === "income") {
		return <EditIncomeForm key={current.id} data={current} navigation={navigation} />;
	}

	return <EditExpenseForm key={current.id} data={current} navigation={navigation} />;
}
