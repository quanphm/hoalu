import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hoalu/ui/table";
import {
	type ColumnDef,
	type InitialTableState,
	type RowData,
	type RowSelectionState,
	type Updater,
	flexRender,
	getCoreRowModel,
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
	 * @default true
	 */
	enableMultiRowSelection?: boolean;
	/**
	 * @default true
	 */
	enablePagination?: boolean;
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
	enableMultiRowSelection = true,
	enablePagination = true,
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
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
		onPaginationChange: setPagination,
		enableMultiRowSelection,
		onRowSelectionChange: handleOnRowSelectionChange,
		state: {
			rowSelection,
			pagination: enablePagination ? pagination : undefined,
		},
	});

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-md border border-border bg-background">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
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
									className="bg-card"
									onClick={row.getToggleSelectedHandler()}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
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
