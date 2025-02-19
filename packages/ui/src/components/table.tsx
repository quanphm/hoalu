import type * as React from "react";
import { cn } from "../utils";

const Table = ({
	className,
	ref,
	...props
}: React.HTMLAttributes<HTMLTableElement> & { ref?: React.Ref<HTMLTableElement> }) => (
	<div className="relative w-full overflow-auto">
		<table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
	</div>
);
Table.displayName = "Table";

const TableHeader = ({
	className,
	ref,
	...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
	ref?: React.Ref<HTMLTableSectionElement>;
}) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />;
TableHeader.displayName = "TableHeader";

const TableBody = ({
	className,
	ref,
	...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
	ref?: React.Ref<HTMLTableSectionElement>;
}) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
TableBody.displayName = "TableBody";

const TableFooter = ({
	className,
	ref,
	...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
	ref?: React.Ref<HTMLTableSectionElement>;
}) => (
	<tfoot
		ref={ref}
		className={cn("border-t bg-muted/50 font-medium last:[&>tr]:border-b-0", className)}
		{...props}
	/>
);
TableFooter.displayName = "TableFooter";

const TableRow = ({
	className,
	ref,
	...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
	ref?: React.Ref<HTMLTableRowElement>;
}) => (
	<tr
		ref={ref}
		className={cn(
			"border-b transition-colors hover:bg-muted/24 data-[state=selected]:bg-muted",
			className,
		)}
		{...props}
	/>
);
TableRow.displayName = "TableRow";

const TableHead = ({
	className,
	ref,
	...props
}: React.HTMLAttributes<HTMLTableCellElement> & {
	ref?: React.Ref<HTMLTableCellElement>;
}) => (
	<th
		ref={ref}
		className={cn(
			"relative h-10 select-none px-4 text-left align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
);
TableHead.displayName = "TableHead";

const TableCell = ({
	className,
	ref,
	...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
	ref?: React.Ref<HTMLTableCellElement>;
}) => (
	<td
		ref={ref}
		className={cn(
			"px-4 py-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
);
TableCell.displayName = "TableCell";

const TableCaption = ({
	className,
	ref,
	...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & {
	ref?: React.Ref<HTMLTableCaptionElement>;
}) => (
	<caption ref={ref} className={cn("mt-4 text-muted-foreground text-sm", className)} {...props} />
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
