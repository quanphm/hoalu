import { createColumnHelper } from "@tanstack/react-table";

import { Badge } from "@hoalu/ui/badge";
import { Frame } from "@hoalu/ui/frame";

import { AVAILABLE_WALLET_TYPE_OPTIONS } from "#app/helpers/constants.ts";
import type { WalletSchema } from "#app/lib/schema.ts";
import { DataTable } from "../data-table";
import { UserAvatar } from "../user-avatar";
import { WalletDropdownMenuWithModal, WalletIcon } from "./wallet-actions";

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
					className="pointer-events-none select-none gap-1.5 p-2"
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
			headerClassName:
				"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
			cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
		},
	}),
];

export function WalletTable({ data }: { data: WalletSchema[] }) {
	return (
		<Frame>
			<DataTable data={data} columns={columns} />
		</Frame>
	);
}
