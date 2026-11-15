import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, type MutableRefObject, type ReactNode } from "react";

import { type CategoryTypeFilter } from "#app/atoms/categories.ts";
import {
	type SyncedCategory,
	useFilteredCategories,
} from "#app/components/categories/use-categories.ts";
import { GroupedVirtualTable } from "#app/components/virtual-table/grouped-virtual-table.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { CATEGORY_TYPE_LABELS } from "#app/helpers/constants.ts";

import type { HeaderOnlyTableFeatures } from "#app/lib/table-features.ts";

const GRID_TEMPLATE = "grid grid-cols-[var(--category-size)_1fr]";

const columns: ColumnDef<HeaderOnlyTableFeatures, SyncedCategory>[] = [
	{ id: "category", header: "Category" },
	{ id: "description", header: "Description" },
];

function CategoryContent(props: SyncedCategory) {
	return (
		<>
			<div className="flex min-w-0 items-center px-4 py-3">
				<Badge className={cn(createCategoryTheme(props.color))} title={props.name}>
					<span className="truncate">{props.name}</span>
				</Badge>
			</div>
			<div className="flex min-w-0 items-center px-4 py-3">
				{props.description ? (
					<p className="text-muted-foreground truncate text-xs" title={props.description}>
						{props.description}
					</p>
				) : (
					<span className="text-muted-foreground text-sm">—</span>
				)}
			</div>
		</>
	);
}

function CategoryGroupHeader({ type, total }: { type: SyncedCategory["type"]; total: number }) {
	return (
		<div
			data-slot="category-group-header"
			className="bg-muted flex w-full items-center gap-2 border-b px-4 py-1 text-xs"
		>
			<span className="font-medium">{CATEGORY_TYPE_LABELS[type]}</span>
			<Badge size="sm" variant="secondary">
				{total}
			</Badge>
		</div>
	);
}

const emptyStates: Record<CategoryTypeFilter, ReactNode> = {
	all: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No categories</EmptyTitle>
				<EmptyDescription>
					Create your first category to start labeling transactions.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
	expense: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No expense categories</EmptyTitle>
				<EmptyDescription>Expense categories will appear here.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
	income: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No income categories</EmptyTitle>
				<EmptyDescription>Income categories will appear here.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
};

function CategoryList({
	typeFilter,
	scrollRef,
}: {
	typeFilter: CategoryTypeFilter;
	scrollRef?: MutableRefObject<number>;
}) {
	const categories = useFilteredCategories();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const handleSelect = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/categories", params: { slug } });
				return;
			}
			navigate({
				to: "/$slug/categories/$categoryId",
				params: { slug, categoryId: id },
				resetScroll: false,
			});
		},
		[navigate, slug],
	);

	const renderGroupHeader = useCallback((groupKey: string, items: SyncedCategory[]) => {
		return <CategoryGroupHeader type={groupKey as SyncedCategory["type"]} total={items.length} />;
	}, []);

	const renderRow = useCallback(
		(item: SyncedCategory, _isSelected: boolean) => <CategoryContent {...item} />,
		[],
	);

	return (
		<GroupedVirtualTable<SyncedCategory, SyncedCategory["type"]>
			items={categories}
			getItemId={(category) => category.id}
			groupBy={typeFilter === "all" ? (category) => category.type : undefined}
			groupOrder={["expense", "income"]}
			renderGroupHeader={renderGroupHeader}
			columns={columns}
			gridTemplate={GRID_TEMPLATE}
			estimateRowSize={45}
			onSelectItem={handleSelect}
			enableKeyboardNav={false}
			scrollPositionRef={scrollRef}
			emptyState={emptyStates[typeFilter]}
			label="Categories"
			renderRow={renderRow}
		/>
	);
}

export default memo(CategoryList);
