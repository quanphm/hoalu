import {
	columnFilteringFeature,
	columnGroupingFeature,
	columnVisibilityFeature,
	constructAggregationFn,
	createExpandedRowModel,
	createFilteredRowModel,
	createGroupedRowModel,
	createPaginatedRowModel,
	rowAggregationFeature,
	rowExpandingFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	tableFeatures,
} from "@tanstack/react-table";

export const expenseConvertedAmountSum = constructAggregationFn({
	aggregate: ({ rows }) =>
		rows.reduce((sum, row) => {
			const value = (row.original as { convertedAmount?: number }).convertedAmount;
			return sum + (typeof value === "number" ? value : 0);
		}, 0),
});

export const dataTableFeatures = tableFeatures({
	columnVisibilityFeature,
	columnGroupingFeature,
	columnFilteringFeature,
	rowExpandingFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowAggregationFeature,
	groupedRowModel: createGroupedRowModel(),
	expandedRowModel: createExpandedRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	filteredRowModel: createFilteredRowModel(),
	aggregationFns: { expenseConvertedAmountSum },
});

export const headerOnlyTableFeatures = tableFeatures({});

export type DataTableFeatures = typeof dataTableFeatures;
export type HeaderOnlyTableFeatures = typeof headerOnlyTableFeatures;
