import { authClient } from "@/lib/auth-client";
import { useRemoveMember } from "@/services/mutations";
import { getActiveMemberOptions } from "@/services/query-options";
import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hoalu/ui/table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
	type ColumnDef,
	type Row,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
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
					<p>{row.original.name}</p>
				</div>
			);
		},
		meta: {
			headerClassName:
				"w-(--header-name-size) min-w-(--header-name-size) max-w-(--header-name-size)",
			cellClassName: "w-(--col-name-size) min-w-(--col-name-size) max-w-(--col-name-size)",
		},
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => {
			return <p className="text-muted-foreground">{row.getValue("email")}</p>;
		},
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
		meta: {
			headerClassName:
				"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
			cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
		},
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
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
		</div>
	);
}

const routeApi = getRouteApi("/_dashboard/$slug/settings/members");

function RowActions({ row }: { row: Row<Item> }) {
	const [open, setOpen] = useState(false);
	const navigate = routeApi.useNavigate();
	const { slug } = routeApi.useParams();
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));
	const canDelete = authClient.workspace.checkRolePermission({
		// @ts-expect-error: [todo] fix role type
		role: member.role,
		permission: {
			member: ["delete"],
		},
	});
	const isLeaving = member.userId === row.original.id;
	const mutation = useRemoveMember();

	const onDelete = async () => {
		await mutation.mutateAsync(row.original.id);
		setOpen(false);
		if (isLeaving) {
			navigate({ to: "/" });
		}
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
					{isLeaving && (
						<DialogTrigger asChild>
							<DropdownMenuItem>
								<span className="text-destructive">Leave</span>
							</DropdownMenuItem>
						</DialogTrigger>
					)}
					{!isLeaving && canDelete && (
						<DialogTrigger asChild>
							<DropdownMenuItem>
								<span className="text-destructive">Remove</span>
							</DropdownMenuItem>
						</DialogTrigger>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>
						{isLeaving ? "Leave this workspace?" : `Remove ${row.original.name}?`}
					</DialogTitle>
					<DialogDescription>
						{isLeaving
							? "You won't be able to access this workspace."
							: "They won't be able to access this workspace."}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={() => onDelete()}>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
