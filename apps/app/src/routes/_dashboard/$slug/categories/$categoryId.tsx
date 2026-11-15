import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffectEvent, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { CategoryNavigation } from "#app/components/categories/category-actions.tsx";
import { EditCategoryForm } from "#app/components/categories/category-edit.tsx";
import { useFilteredCategories } from "#app/components/categories/use-categories.ts";

export const Route = createFileRoute("/_dashboard/$slug/categories/$categoryId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { categoryId } = Route.useParams();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const categories = useFilteredCategories();

	const currentIndex = categories.findIndex((category) => category.id === categoryId);
	const current = currentIndex >= 0 ? categories[currentIndex] : undefined;

	const categoriesRef = useRef(categories);
	categoriesRef.current = categories;
	const slugRef = useRef(slug);
	slugRef.current = slug;

	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const pendingRef = useRef<"up" | "down" | null>(null);

	const flushNav = useEffectEvent(() => {
		const items = categoriesRef.current;
		const s = slugRef.current;
		const idx = items.findIndex((category) => category.id === categoryId);
		if (idx < 0) return;

		const targetIdx = pendingRef.current === "down" ? idx + 1 : idx - 1;
		const target = items[targetIdx];
		if (!target) return;

		navigate({
			to: "/$slug/categories/$categoryId",
			params: { slug: s, categoryId: target.id },
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
		navigate({ to: "/$slug/categories", params: { slug } });
	}, [navigate, slug]);

	useHotkeys("j", handleGoDown, [handleGoDown]);
	useHotkeys("k", handleGoUp, [handleGoUp]);
	useHotkeys("esc", handleClose, [handleClose]);

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < categories.length - 1;

	if (!current) return null;

	return (
		<EditCategoryForm
			key={current.id}
			category={current}
			onClose={handleClose}
			headerActions={
				<CategoryNavigation
					category={current}
					onGoUp={handleGoUp}
					onGoDown={handleGoDown}
					canGoUp={canGoUp}
					canGoDown={canGoDown}
				/>
			}
		/>
	);
}
