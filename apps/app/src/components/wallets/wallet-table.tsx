import { AVAILABLE_WALLET_TYPE_OPTIONS } from "#app/helpers/constants.ts";
import { Badge } from "@hoalu/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";

import { DataTable } from "../data-table";
import { UserAvatar } from "../user-avatar";
import { WalletDropdownMenuWithModal, WalletIcon } from "./wallet-actions";

import type { WalletSchema } from "#app/lib/schema.ts";

const columnHelper = createColumnHelper<WalletSchema>();

const columns = [
	columnHelper.accessor("name", {
		header: "Wallet",
		cell: (info) => {
			return <span className="font-medium">{info.getValue()}</span>;
		},
	}),
	columnHelper.accessor("description", {
		header: "Description",
		cell: (info) => info.getValue(),
	}),
	columnHelper.display({
		id: "type",
		header: "Type",
		cell: (info) => {
			return (
				<p className="flex items-center gap-1.5">
					<WalletIcon type={info.row.original.type} />
					{
						AVAILABLE_WALLET_TYPE_OPTIONS.find((option) => option.value === info.row.original.type)
							?.label
					}
				</p>
			);
		},
	}),
	columnHelper.accessor("isActive", {
		header: "Status",
		cell: (info) => {
			const isActive = info.getValue();
			return (
				<Badge
					variant={isActive ? "success" : "secondary"}
					className="pointer-events-none gap-1.5 p-2 select-none"
				>
					{isActive ? "Active" : "Inactive"}
				</Badge>
			);
		},
	}),
	columnHelper.accessor("owner", {
		header: "Owner",
		cell: (info) => {
			const owner = info.getValue();
			return (
				<div className="flex items-center gap-1.5">
					<UserAvatar className="size-6" name={owner.name} image={owner.image} />
					<p className="text-muted-foreground text-xs leading-0">{owner.name}</p>
				</div>
			);
		},
	}),
	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => <WalletDropdownMenuWithModal id={info.row.original.id} />,
		meta: {
			headerClassName: "w-(--action-size) min-w-(--action-size) max-w-(--action-size)",
			cellClassName: "w-(--action-size) min-w-(--action-size) max-w-(--action-size)",
		},
	}),
];

export function WalletTable({ data }: { data: WalletSchema[] }) {
	return <DataTable data={data} columns={columns} />;
}
