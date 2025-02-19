import { authClient } from "@/lib/auth-client";
import { useCancelInvitation, useRemoveMember } from "@/services/mutations";
import { workspaceKeys } from "@/services/query-key-factory";
import { getActiveMemberOptions } from "@/services/query-options";
import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
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
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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

type Item = {
	id: string;
	email: string;
	status: "pending" | "canceled" | "rejected" | "accepted";
};

const columns: ColumnDef<Item>[] = [
	{
		accessorKey: "email",
		header: "Email",
		size: 200,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			return <p className="text-muted-foreground capitalize">{row.getValue("status")}</p>;
		},
		size: 200,
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <RowActions row={row} />,
		size: 32,
	},
];

export function InvitationsTable({ data }: { data: Item[] }) {
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
							<TableRow key={headerGroup.id} className="bg-muted/50">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{ width: `${header.getSize()}px` }}
											className="relative h-10"
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
											className="py-3 last:py-0"
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

const routeApi = getRouteApi("/_dashboard/$slug/members");

function RowActions({ row }: { row: Row<Item> }) {
	const [open, setOpen] = useState(false);
	const params = routeApi.useParams();
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(params.slug));
	const canUpdate = authClient.workspace.checkRolePermission({
		role: member.role,
		permission: {
			member: ["update"],
		},
	});
	const queryClient = useQueryClient();
	const mutation = useCancelInvitation();

	const onCancel = async () => {
		await mutation.mutateAsync(row.original.id);
		queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(params.slug) });
		setOpen(false);
	};

	if (!canUpdate) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontalIcon className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild>
						<DropdownMenuItem>
							<span className="text-destructive">Cancel</span>
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>

			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Cancel this invitation?</DialogTitle>
					<DialogDescription>
						This will delete invitation you have sent to this account. You can always re-invite this
						account again.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							No
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={() => onCancel()}>
						Yes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
