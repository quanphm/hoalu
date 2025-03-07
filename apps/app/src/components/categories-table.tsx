import { DataTable } from "@/components/data-table";
import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { useState } from "react";

type Item = {
	id: string;
	name: string;
	description: string | null;
	color:
		| "red"
		| "green"
		| "blue"
		| "cyan"
		| "yellow"
		| "orange"
		| "purple"
		| "fuchsia"
		| "pink"
		| "rose"
		| "gray"
		| "stone";
};

const columns: ColumnDef<Item>[] = [
	{
		id: "name",
		header: "Category",
		cell: ({ row }) => {
			return <p className="font-medium">{row.original.name}</p>;
		},
		meta: {
			headerClassName:
				"w-(--header-name-size) min-w-(--header-name-size) max-w-(--header-name-size)",
			cellClassName: "w-(--col-name-size) min-w-(--col-name-size) max-w-(--col-name-size)",
		},
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => {
			return <p className="text-muted-foreground">{row.getValue("description")}</p>;
		},
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <RowActions row={row} />,
		meta: {
			headerClassName:
				"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
			cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
		},
	},
];

export function CategoriesTable({ data }: { data: Item[] }) {
	return <DataTable data={data} columns={columns} />;
}

function RowActions({ row }: { row: Row<Item> }) {
	const [open, setOpen] = useState(false);
	const onDelete = async () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild>
						<DropdownMenuItem>
							<span className="text-destructive">Delete</span>
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>

			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Delete this category?</DialogTitle>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							No
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={() => onDelete()}>
						Yes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
