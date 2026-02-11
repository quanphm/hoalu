import { ChevronFirstIcon, ChevronLastIcon, ChevronLeft, ChevronRight } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Label } from "@hoalu/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@hoalu/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hoalu/ui/select";
import type { Table } from "@tanstack/react-table";
import { useId } from "react";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

const items = [
	{ label: "Select number of results", value: null },
	{ label: "5", value: 5 },
	{ label: "10", value: 10 },
	{ label: "25", value: 25 },
	{ label: "50", value: 50 },
];

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
	const id = useId();

	return (
		<div className="flex items-center justify-between gap-8">
			{/* Results per page */}
			<div className="flex items-center gap-3">
				<Label htmlFor={id} className="max-sm:sr-only">
					Rows per page
				</Label>
				<Select
					items={items}
					value={table.getState().pagination.pageSize}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<SelectTrigger id={id} className="w-fit whitespace-nowrap">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
						{items.map((pageSize) => (
							<SelectItem key={pageSize.value} value={pageSize.toString()}>
								{pageSize.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Page number information */}
			<div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
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
			</div>

			{/* Pagination buttons */}
			<div>
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<Button
								size="icon"
								variant="outline"
								className="disabled:pointer-events-none disabled:opacity-50"
								onClick={() => table.firstPage()}
								disabled={!table.getCanPreviousPage()}
								aria-label="Go to first page"
							>
								<ChevronFirstIcon size={16} strokeWidth={2} aria-hidden="true" />
							</Button>
						</PaginationItem>
						<PaginationItem>
							<Button
								size="icon"
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
								size="icon"
								variant="outline"
								className="disabled:pointer-events-none disabled:opacity-50"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
								aria-label="Go to next page"
							>
								<ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
							</Button>
						</PaginationItem>
						<PaginationItem>
							<Button
								size="icon"
								variant="outline"
								className="disabled:pointer-events-none disabled:opacity-50"
								onClick={() => table.lastPage()}
								disabled={!table.getCanNextPage()}
								aria-label="Go to last page"
							>
								<ChevronLastIcon size={16} strokeWidth={2} aria-hidden="true" />
							</Button>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
