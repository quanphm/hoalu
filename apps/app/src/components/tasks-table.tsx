import { createColumnHelper, type Row } from "@tanstack/react-table";
import { useState } from "react";

import { MoreVerticalIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogTrigger } from "@hoalu/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { DataTable } from "@/components/data-table";
import type { TaskSchema } from "@/lib/schema";

const columnHelper = createColumnHelper<TaskSchema>();

const columns = [
	columnHelper.accessor("title", {
		header: "Task",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => {
			const value = info.getValue();
			return value === "done" ? <Badge>Completed</Badge> : <Badge variant="outline">{value}</Badge>;
		},
	}),
	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => <RowActions row={info.row} />,
		meta: {
			headerClassName:
				"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
			cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
		},
	}),
];

export function TasksTable({ data }: { data: TaskSchema[] }) {
	return <DataTable data={data} columns={columns} />;
}

function RowActions({ row: _row }: { row: Row<TaskSchema> }) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreVerticalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger
						render={<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>}
					/>
				</DropdownMenuContent>
			</DropdownMenu>
		</Dialog>
	);
}
