import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hoalu/ui/table";
import {
	type ColumnDef,
	type Row,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { UserAvatar } from "./user-avatar";

type Item = {
	id: string;
	name: string;
	email: string;
	image: string | null | undefined;
	role: string;
};

const columns: ColumnDef<Item>[] = [
	{
		id: "name",
		header: "Name",
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-3">
					<UserAvatar name={row.original.name} image={row.original.image} />
					<div>
						<div className="font-medium">{row.original.name}</div>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => {
			return <p className="text-muted-foreground">{row.getValue("email")}</p>;
		},
		size: 200,
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			const { role } = row.original;
			return (
				<Badge
					variant={role === "owner" ? "success" : "outline"}
					className="px-1.5 font-normal text-xs capitalize"
				>
					{role}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <RowActions row={row} />,
		size: 32,
	},
];

export function MembersTable({ data }: { data: Item[] }) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-lg border bg-background">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="bg-muted/50">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{ width: `${header.getSize()}px` }}
											className="relative h-11"
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
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{
												width: cell.column.getSize(),
											}}
											className="last:py-0"
										>
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
		</div>
	);
}

function RowActions({ row }: { row: Row<Item> }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontalIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>
					<span className="text-destructive">Remove</span>
				</DropdownMenuItem>
				<DropdownMenuItem>View payment details</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
