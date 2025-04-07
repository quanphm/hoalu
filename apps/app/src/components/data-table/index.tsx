import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hoalu/ui/table";
import {
	type ColumnDef,
	type Row,
	type RowData,
	type RowSelectionState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useTransition } from "react";
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
	onRowClick?(updaterOrValue: Row<T>): void;
}

export function DataTable<T extends TableRowData>({
	data,
	columns,
	onRowClick,
	enableMultiRowSelection = true,
	enablePagination = true,
}: DataTableProps<T>) {
	const [_isPending, startTransition] = useTransition();
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
		onPaginationChange: setPagination,
		enableMultiRowSelection,
		onRowSelectionChange: setRowSelection,
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
									onClick={(e) => {
										row.getToggleSelectedHandler()(e);
										if (onRowClick) {
											startTransition(() => {
												onRowClick(row);
											});
										}
									}}
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
