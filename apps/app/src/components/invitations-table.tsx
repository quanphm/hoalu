import { DataTable } from "#app/components/data-table/index.tsx";
import { authClient } from "#app/lib/auth-client.ts";
import { useCancelInvitation } from "#app/services/mutations.ts";
import { getActiveMemberOptions } from "#app/services/query-options.ts";
import { datetime } from "@hoalu/common/datetime";
import { MoreVerticalIcon } from "@hoalu/icons/lucide";
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
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { useState } from "react";

import { InputWithCopy } from "./input-with-copy";

type Member = {
	id: string;
	email: string;
	status: "canceled" | "accepted" | "rejected" | "pending";
	expiresAt: Date;
};

const columnHelper = createColumnHelper<Member>();

const columns = [
	columnHelper.accessor("email", {
		header: "Email",
		meta: {
			headerClassName: "w-(--name-size) min-w-(--name-size) max-w-(--name-size)",
			cellClassName: "w-(--name-size) min-w-(--name-size) max-w-(--name-size)",
		},
	}),
	columnHelper.accessor("id", {
		header: "Invitation link",
		cell: ({ getValue }) => {
			const id = getValue();
			const value = `${import.meta.env.PUBLIC_APP_BASE_URL}/invite/${id}/accept`;
			return <InputWithCopy value={value} />;
		},
		meta: {
			headerClassName: "w-(--link-size) min-w-(--link-size) max-w-(--link-size)",
			cellClassName: "w-(--link-size) min-w-(--link-size) max-w-(--link-size)",
		},
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: ({ getValue }) => {
			return <p className="text-muted-foreground capitalize">{getValue()}</p>;
		},
	}),
	columnHelper.accessor("expiresAt", {
		header: "Expiration time",
		cell: ({ getValue }) => {
			const value = datetime.format(getValue().toString(), "HH:mm d MMM yyyy");
			return <p className="text-muted-foreground capitalize">{value}</p>;
		},
	}),
	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => <RowActions row={info.row} />,
		meta: {
			headerClassName: "w-(--action-size) min-w-(--action-size) max-w-(--action-size)",
			cellClassName: "w-(--action-size) min-w-(--action-size) max-w-(--action-size)",
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
				<DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
					<span className="sr-only">Open menu</span>
					<MoreVerticalIcon className="size-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger render={<DropdownMenuItem />}>
						<span className="text-destructive">Cancel</span>
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
					<DialogClose render={<Button type="button" variant="outline" />}>No</DialogClose>
					<Button variant="destructive" onClick={() => onCancel()}>
						Yes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
