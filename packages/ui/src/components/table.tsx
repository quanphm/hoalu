import type * as React from "react";
import { cn } from "../utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
	return (
		<div className="relative w-full">
			<table
				data-slot="table"
				className={cn("w-full caption-bottom border-spacing-0 text-sm", className)}
				{...props}
			/>
		</div>
	);
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
	return <thead data-slot="table-header" className={cn("bg-muted/50", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
	return (
		<tbody
			data-slot="table-body"
			className={cn("outline-0 focus-visible:outline [&_tr:last-child]:border-0", className)}
			tabIndex={-1}
			{...props}
		/>
	);
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
	return (
		<tfoot
			data-slot="table-footer"
			className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
			{...props}
		/>
	);
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				"transition-colors hover:bg-muted data-[state=selected]:bg-muted",
				"-outline-offset-1 outline-0 outline-primary focus-visible:outline data-[state=selected]:outline",
				// "[&>*]:border-t [&>:not(:last-child)]:border-b",
				className,
			)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				"h-12 select-none border-b px-3 text-left align-middle font-medium text-muted-foreground has-[role=checkbox]:w-px [&:has([role=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
	return (
		<td
			data-slot="table-cell"
			className={cn("select-none p-3 align-middle [&:has([role=checkbox])]:pr-0", className)}
			{...props}
		/>
	);
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
	return (
		<caption
			data-slot="table-caption"
			className={cn("mt-4 text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
