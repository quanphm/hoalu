import { ChevronDownIcon, ChevronRightIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hoalu/ui/table";
import { cn } from "@hoalu/ui/utils";
import {
	type ColumnDef,
	type ExpandedState,
	type GroupingState,
	type InitialTableState,
	type RowData,
	type RowSelectionState,
	type Updater,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useState, useTransition } from "react";
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
	onRowClick?(rows: T[]): void;
}

const initialStateValue: InitialTableState = {
	rowSelection: {},
};

export function DataTable<T extends TableRowData>({
	data,
	columns,
	onRowClick,
	enableMultiRowSelection = false,
	enablePagination = false,
	enableGrouping = false,
	initialState = initialStateValue,
}: DataTableProps<T>) {
	const [_isPending, startTransition] = useTransition();

	const [rowSelection, setRowSelection] = useState<RowSelectionState>(
		initialState?.rowSelection ?? {},
	);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [grouping, setGrouping] = useState<GroupingState>(initialState?.grouping ?? []);
	const [expanded, setExpanded] = useState<ExpandedState>(initialState?.expanded ?? {});

	const handleOnRowSelectionChange = useCallback(
		(valueFn: Updater<RowSelectionState>) => {
			if (typeof valueFn === "function") {
				const updatedRowSelection = valueFn(rowSelection);
				setRowSelection(updatedRowSelection);
				const selectedRows = Object.keys(updatedRowSelection).reduce((acc, key) => {
					if (updatedRowSelection[key]) {
						const row = data.find((row) => row.id === key);
						if (row) acc.push(row);
					}
					return acc;
				}, [] as T[]);
				if (onRowClick) {
					startTransition(() => {
						onRowClick(selectedRows);
					});
				}
			}
		},
		[data, onRowClick, rowSelection],
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			rowSelection,
			pagination,
			grouping,
			expanded,
		},
		enableMultiRowSelection,
		getExpandedRowModel: enableGrouping ? getExpandedRowModel() : undefined,
		getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
		getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
		getFilteredRowModel: getFilteredRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		onGroupingChange: setGrouping,
		onPaginationChange: setPagination,
		onExpandedChange: setExpanded,
		onRowSelectionChange: handleOnRowSelectionChange,
		groupedColumnMode: false,
		aggregationFns: {
			expenseSum: (columnId, _leafRows, childRows) => {
				// console.group(columnId);
				// console.log(childRows);
				// console.groupEnd();
				return childRows.reduce((sum, current) => {
					const value = current.original.realAmount;
					return sum + (typeof value === "number" ? value : 0);
				}, 0);
			},
		},
	});

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-md border border-border bg-background">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="bg-muted/80 hover:bg-muted/80">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className={cn(header.column.columnDef.meta?.headerClassName)}
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
									className="group bg-card"
									onClick={row.getToggleSelectedHandler()}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											data-group={
												cell.getIsGrouped() || cell.getIsAggregated() ? "grouped" : "cell"
											}
											className={cn(
												cell.column.columnDef.meta?.cellClassName,
												"group-has-[[data-group=grouped]]:bg-muted/80 dark:group-has-[[data-group=grouped]]:bg-background/60",
											)}
										>
											{cell.getIsGrouped() ? (
												<>
													<Button variant="ghost" onClick={row.getToggleExpandedHandler()}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())} (
														{row.subRows.length})
														{row.getIsExpanded() ? (
															<ChevronDownIcon
																size={12}
																className="ml-2 text-muted-foreground/80"
															/>
														) : (
															<ChevronRightIcon
																size={12}
																className="ml-2 text-muted-foreground/80"
															/>
														)}
													</Button>
												</>
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
