import {
	// ChevronFirstIcon,
	// ChevronLastIcon,
	ChevronLeft,
	ChevronRight,
} from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Label } from "@hoalu/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@hoalu/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hoalu/ui/select";
import type { Table } from "@tanstack/react-table";
import { useId } from "react";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	config: {
		showPerPage?: boolean;
		showPageNumberInfo?: boolean;
		showNavigationButtons?: boolean;
	};
}

const items = [
	{ label: "10", value: 10 },
	{ label: "25", value: 25 },
	{ label: "50", value: 50 },
	{ label: "100", value: 100 },
];

export function DataTablePagination<TData>({ table, config }: DataTablePaginationProps<TData>) {
	const id = useId();

	return (
		<div className="flex items-center justify-between gap-4">
			{/* Results per page */}
			<div className="flex items-center gap-3">
				{config.showPerPage && (
					<>
						<Label htmlFor={id} className="max-sm:sr-only">
							Viewing
						</Label>
						<Select
							items={items}
							value={table.getState().pagination.pageSize}
							onValueChange={(value) => {
								if (!value) return;
								table.setPageSize(value);
							}}
						>
							<SelectTrigger size="sm" id={id} className="w-fit whitespace-nowrap">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:inset-e-2">
								{items.map((pageSize) => (
									<SelectItem key={pageSize.value} value={pageSize.value}>
										{pageSize.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</>
				)}
			</div>

			{/* Page number information */}
			<div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
				{config.showPageNumberInfo && (
					<p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
						<span className="text-foreground">
							{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
							{Math.min(
								Math.max(
									table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
										table.getState().pagination.pageSize,
									0,
								),
								table.getRowCount(),
							)}
						</span>{" "}
						of <span className="text-foreground">{table.getRowCount().toString()}</span>
					</p>
				)}
			</div>

			{/* Pagination buttons */}
			<div>
				{config.showNavigationButtons && (
					<Pagination>
						<PaginationContent>
							{/* <PaginationItem>
								<Button
									size="icon-sm"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.firstPage()}
									disabled={!table.getCanPreviousPage()}
									aria-label="Go to first page"
								>
									<ChevronFirstIcon size={16} strokeWidth={2} aria-hidden="true" />
								</Button>
							</PaginationItem> */}
							<PaginationItem>
								<Button
									size="icon-sm"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
									aria-label="Go to previous page"
								>
									<ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
								</Button>
							</PaginationItem>
							<PaginationItem>
								<Button
									size="icon-sm"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}
									aria-label="Go to next page"
								>
									<ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
								</Button>
							</PaginationItem>
							{/* <PaginationItem>
								<Button
									size="icon-sm"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.lastPage()}
									disabled={!table.getCanNextPage()}
									aria-label="Go to last page"
								>
									<ChevronLastIcon size={16} strokeWidth={2} aria-hidden="true" />
								</Button>
							</PaginationItem> */}
						</PaginationContent>
					</Pagination>
				)}
			</div>
		</div>
	);
}
