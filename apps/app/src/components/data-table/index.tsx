import { useLayoutEffect } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	type GroupingState,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	type InitialTableState,
	type RowData,
	type RowSelectionState,
	type Updater,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useRef, useState, useTransition } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { ChevronDownIcon, ChevronRightIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hoalu/ui/table";
import { cn } from "@hoalu/ui/utils";
import { DataTablePagination } from "./data-table-pagination";

type TableRowData = { id: string } & RowData;

interface DataTableProps<T extends TableRowData> {
	data: T[];
	columns: ColumnDef<T, any>[];
	/**
	 * @default false
	 */
	enableMultiRowSelection?: boolean;
	/**
	 * @default false
	 */
	enablePagination?: boolean;
	/**
	 * @default false
	 */
	enableGrouping?: boolean;
	initialState?: InitialTableState;
	controlledState?: InitialTableState;
	onRowClick?(rows: T[]): void;
	/**
	 * Other customizations
	 */
	tableClassName?: string;
}

const initialControlledState: InitialTableState = {
	rowSelection: {},
};

export function DataTable<T extends TableRowData>({
	data,
	columns,
	onRowClick,
	enableMultiRowSelection = false,
	enablePagination = false,
	enableGrouping = false,
	initialState = {
		expanded: true,
	},
	controlledState = initialControlledState,
	tableClassName,
}: DataTableProps<T>) {
	const [_isPending, startTransition] = useTransition();
	const tableContainerRef = useRef<HTMLDivElement>(null);

	/**
	 * Controlled states
	 */
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>(
		controlledState?.rowSelection ?? {},
	);
	const [grouping, setGrouping] = useState<GroupingState>(controlledState?.grouping ?? []);

	const handleOnRowSelectionChange = useCallback(
		(valueFn: Updater<RowSelectionState>) => {
			if (typeof valueFn !== "function") return;

			const updatedRowSelection = valueFn(rowSelection);
			setRowSelection(updatedRowSelection);

			if (onRowClick) {
				const selectedRows = Object.keys(updatedRowSelection).reduce((acc, key) => {
					const row = data.find((row) => row.id === key);
					if (row) acc.push(row);
					return acc;
				}, [] as T[]);

				startTransition(() => {
					onRowClick(selectedRows);
				});
			}
		},
		[data, onRowClick, rowSelection],
	);

	const table = useReactTable({
		data,
		columns,
		initialState,
		state: {
			pagination,
			rowSelection,
			grouping,
		},
		/**
		 * @see https://tanstack.com/table/v8/docs/guide/row-models#the-order-of-row-model-execution
		 */
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
		getExpandedRowModel: enableGrouping ? getExpandedRowModel() : undefined,
		getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
		getRowId: (row) => row.id,
		enableMultiRowSelection,
		onGroupingChange: enableGrouping ? setGrouping : () => undefined,
		// onExpandedChange: enableGrouping ? handleExpendedChange : () => undefined,
		onPaginationChange: enablePagination ? setPagination : () => undefined,
		onRowSelectionChange: handleOnRowSelectionChange,
		groupedColumnMode: false,
		debugTable: false,
		aggregationFns: {
			expenseConvertedAmountSum: (_columnId, _leafRows, childRows) => {
				return childRows.reduce((sum, current) => {
					const value = current.original.convertedAmount;
					return sum + (typeof value === "number" ? value : 0);
				}, 0);
			},
		},
	});

	useHotkeys(
		"j",
		(_data) => {
			const selectedRow = table.getSelectedRowModel().rows[0];
			if (!selectedRow) return;

			const currentIndex = selectedRow.index;
			const nextIndex = currentIndex + 1;
			const nextRowData = table.getCoreRowModel().rows[nextIndex];

			if (nextRowData) {
				const nextRowId = nextRowData.original.id;
				setRowSelection({ [nextRowId]: true });

				// side-effect
				if (onRowClick) {
					const selectedRows = data.find((row) => row.id === nextRowId);
					if (!selectedRows) return;
					startTransition(() => {
						onRowClick([selectedRows]);
					});
				}
			}
		},
		[],
	);

	useHotkeys(
		"k",
		(_data) => {
			const selectedRow = table.getSelectedRowModel().rows[0];
			if (!selectedRow) return;

			const currentIndex = selectedRow.index;
			const prevIndex = currentIndex - 1;
			const prevRowData = table.getCoreRowModel().rows[prevIndex];

			if (prevRowData) {
				const prevRowId = prevRowData.original.id;
				setRowSelection({ [prevRowId]: true });

				// side-effect
				if (onRowClick) {
					const selectedRows = data.find((row) => row.id === prevRowId);
					if (!selectedRows) return;
					startTransition(() => {
						onRowClick([selectedRows]);
					});
				}
			}
		},
		[],
	);

	useHotkeys("esc", () => {
		setRowSelection({});
	}, []);

	useLayoutEffect(() => {
		if (!tableContainerRef.current) {
			return;
		}

		const selectedRowId = Object.keys(rowSelection).find((key) => rowSelection[key]);
		if (selectedRowId) {
			const rowElement = tableContainerRef.current.querySelector(
				`tr[data-row-id="${selectedRowId}"]`,
			);
			if (rowElement) {
				rowElement.scrollIntoView({
					behavior: "instant",
					block: "nearest",
				});
			}
		}
	}, [rowSelection]);

	const expanedState = table.getIsAllRowsExpanded();
	const showToolbar = !!enableGrouping;

	return (
		<div className="flex flex-col gap-2">
			{showToolbar && (
				<div className="flex gap-4">
					{enableGrouping && (
						<Button
							variant="outline"
							onClick={() => {
								table.toggleAllRowsExpanded();
							}}
						>
							{expanedState ? "Collapse" : "Expand"}
						</Button>
					)}
				</div>
			)}

			<div ref={tableContainerRef} className={cn("overflow-hidden", tableClassName)}>
				<Table>
					<TableHeader className="sticky top-0 bg-card">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className={header.column.columnDef.meta?.headerClassName}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									data-row-id={row.id}
									className="group bg-card"
									onClick={(ev) => {
										if (row.groupingColumnId) return;
										row.getToggleSelectedHandler()(ev);
									}}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											data-group={
												cell.getIsGrouped() || cell.getIsAggregated() ? "grouped" : "cell"
											}
											className={cn(
												cell.column.columnDef.meta?.cellClassName,
												"group-has-[[data-group=grouped]]:bg-accent group-hover:group-has-[[data-group=grouped]]:bg-accent",
											)}
										>
											{cell.getIsGrouped() ? (
												<Button
													variant="ghost"
													size="date"
													className="hover:bg-transparent"
													onClick={row.getToggleExpandedHandler()}
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())} (
													{row.subRows.length})
													{row.getIsExpanded() ? (
														<ChevronDownIcon size={12} className="ml-2 text-muted-foreground/80" />
													) : (
														<ChevronRightIcon size={12} className="ml-2 text-muted-foreground/80" />
													)}
												</Button>
											) : cell.getIsAggregated() ? (
												flexRender(
													cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
													cell.getContext(),
												)
											) : cell.getIsPlaceholder() ? null : (
												flexRender(cell.column.columnDef.cell, cell.getContext())
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{enablePagination && <DataTablePagination table={table} />}
		</div>
	);
}
