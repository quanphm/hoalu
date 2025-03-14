import { DataTable } from "@/components/data-table";
import { authClient } from "@/lib/auth-client";
import { useCancelInvitation } from "@/services/mutations";
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { type Row, createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";

type Member = {
	id: string;
	email: string;
	status: "canceled" | "accepted" | "rejected" | "pending";
};

const columnHelper = createColumnHelper<Member>();

const columns = [
	columnHelper.accessor("email", {
		header: "Email",
		meta: {
			headerClassName:
				"w-(--header-name-size) min-w-(--header-name-size) max-w-(--header-name-size)",
			cellClassName: "w-(--col-name-size) min-w-(--col-name-size) max-w-(--col-name-size)",
		},
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: ({ row }) => {
			return <p className="text-muted-foreground capitalize">{row.getValue("status")}</p>;
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

export function InvitationsTable({ data }: { data: Member[] }) {
	return <DataTable data={data} columns={columns} />;
}

const routeApi = getRouteApi("/_dashboard/$slug/settings/members");

function RowActions({ row }: { row: Row<Member> }) {
	const [open, setOpen] = useState(false);
	const { slug } = routeApi.useParams();
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));
	const canUpdate = authClient.workspace.checkRolePermission({
		// @ts-expect-error: [todo] fix role type
		role: member.role,
		permission: {
			member: ["update"],
		},
	});
	const mutation = useCancelInvitation();

	const onCancel = async () => {
		await mutation.mutateAsync({ id: row.original.id });
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
						<MoreHorizontalIcon className="size-4" />
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
