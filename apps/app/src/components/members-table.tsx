import { DataTable } from "@/components/data-table";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { useRemoveMember } from "@/services/mutations";
import { getActiveMemberOptions } from "@/services/query-options";
import { MoreVerticalIcon } from "@hoalu/icons/lucide";
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { type Row, createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";

type MemberSchema = {
	id: string;
	name: string;
	email: string;
	image: string | null | undefined;
	role: string;
};

const columnHelper = createColumnHelper<MemberSchema>();

const columns = [
	columnHelper.display({
		id: "name",
		header: "Name",
		cell: (info) => {
			return (
				<div className="flex items-center gap-3">
					<UserAvatar name={info.row.original.name} image={info.row.original.image} />
					<p>{info.row.original.name}</p>
				</div>
			);
		},
		meta: {
			headerClassName:
				"w-(--header-name-size) min-w-(--header-name-size) max-w-(--header-name-size)",
			cellClassName: "w-(--col-name-size) min-w-(--col-name-size) max-w-(--col-name-size)",
		},
	}),
	columnHelper.accessor("email", {
		header: "Email",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("role", {
		header: "Role",
		cell: (info) => {
			const value = info.getValue();
			return (
				<Badge
					variant={value === "owner" ? "emerald" : "outline"}
					className="px-1.5 font-normal text-xs capitalize"
				>
					{value}
				</Badge>
			);
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

export function MembersTable({ data }: { data: MemberSchema[] }) {
	return <DataTable data={data} columns={columns} />;
}

const routeApi = getRouteApi("/_dashboard/$slug");

function RowActions({ row }: { row: Row<MemberSchema> }) {
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
		await mutation.mutateAsync({ id: row.original.id });
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
						<MoreVerticalIcon className="size-4" />
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
