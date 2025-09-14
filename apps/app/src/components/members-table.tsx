import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { useState } from "react";

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
import { DataTable } from "@/components/data-table";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { useRemoveMember } from "@/services/mutations";
import { getActiveMemberOptions } from "@/services/query-options";

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
		cell: (info) => <NameCell row={info.row} />,
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
					variant={value === "owner" ? "default" : "outline"}
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
				<DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
					<span className="sr-only">Open menu</span>
					<MoreVerticalIcon className="size-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{isLeaving && (
						<DialogTrigger
							render={
								<DropdownMenuItem>
									<span className="text-destructive">Leave</span>
								</DropdownMenuItem>
							}
						/>
					)}
					{!isLeaving && canDelete && (
						<DialogTrigger
							render={
								<DropdownMenuItem>
									<span className="text-destructive">Remove</span>
								</DropdownMenuItem>
							}
						/>
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
					<DialogClose render={<Button type="button" variant="secondary" />}>No</DialogClose>
					<Button variant="destructive" onClick={onDelete}>
						Yes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function NameCell({ row }: { row: Row<MemberSchema> }) {
	const { user } = useAuth();

	return (
		<div className="flex items-center gap-2">
			<UserAvatar name={row.original.name} image={row.original.image} />
			<p>{row.original.name}</p>
			{row.original.id === user?.id && <Badge variant="outline">You</Badge>}
		</div>
	);
}
