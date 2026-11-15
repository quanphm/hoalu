import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo, type MutableRefObject, type ReactNode } from "react";

import { UserAvatar } from "#app/components/user-avatar.tsx";
import { GroupedVirtualTable } from "#app/components/virtual-table/grouped-virtual-table.tsx";
import { WalletDropdownMenu, WalletIcon } from "#app/components/wallets/wallet-actions.tsx";
import { AVAILABLE_WALLET_TYPE_OPTIONS } from "#app/helpers/constants.ts";

import type { WalletSchema } from "#app/lib/schema.ts";
import type { HeaderOnlyTableFeatures } from "#app/lib/table-features.ts";
import type { WalletTypeSchema } from "@hoalu/schema/schema";

const GRID_TEMPLATE =
	"grid grid-cols-[var(--name-size)_1fr_var(--status-size)_var(--wallet-size)_var(--action-size)]";

const WALLET_TYPE_ORDER = AVAILABLE_WALLET_TYPE_OPTIONS.map((option) => option.value);

const columns: ColumnDef<HeaderOnlyTableFeatures, WalletSchema>[] = [
	{ id: "name", header: "Wallet" },
	{ id: "description", header: "Description" },
	{ id: "status", header: "Status" },
	{ id: "owner", header: "Owner" },
	{ id: "actions", header: "", meta: { headerClassName: "justify-end" } },
];

function WalletGroupHeader({ type, total }: { type: WalletTypeSchema; total: number }) {
	const label =
		AVAILABLE_WALLET_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

	return (
		<div
			data-slot="wallet-group-header"
			className="bg-muted flex w-full items-center gap-2 border-b px-4 py-1 text-xs"
		>
			<WalletIcon type={type} />
			<span className="font-medium">{label}</span>
			<Badge size="sm" variant="secondary">
				{total}
			</Badge>
		</div>
	);
}

function WalletContent(props: WalletSchema) {
	return (
		<>
			<div className="flex min-w-0 items-center px-4 py-3">
				<p
					className={cn("truncate text-sm font-medium", !props.isActive && "text-muted-foreground")}
					title={props.name}
				>
					{props.name}
				</p>
			</div>
			<div className="flex min-w-0 items-center px-4 py-3">
				{props.description ? (
					<p className="text-muted-foreground truncate text-xs" title={props.description}>
						{props.description}
					</p>
				) : (
					<span className="text-muted-foreground text-sm">—</span>
				)}
			</div>
			<div className="flex items-center px-4 py-3">
				{props.isActive ? (
					<Badge variant="success">Active</Badge>
				) : (
					<Badge variant="muted">Inactive</Badge>
				)}
			</div>
			<div className="flex min-w-0 items-center gap-1.5 px-4 py-3">
				<UserAvatar className="size-5" name={props.owner.name} image={props.owner.image} />
				<p className="text-muted-foreground truncate text-xs" title={props.owner.name}>
					{props.owner.name}
				</p>
			</div>
			<div className="flex items-center justify-end px-4">
				<WalletDropdownMenu id={props.id} />
			</div>
		</>
	);
}

export type WalletStatusFilter = "all" | "active" | "inactive";

const emptyStates: Record<WalletStatusFilter, ReactNode> = {
	all: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No wallets</EmptyTitle>
				<EmptyDescription>
					Create your first wallet to track where your money lives.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
	active: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No wallets in use</EmptyTitle>
				<EmptyDescription>Wallets you can spend from will appear here.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
	inactive: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No retired wallets</EmptyTitle>
				<EmptyDescription>Wallets taken out of use will appear here.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
};

function WalletList({
	wallets,
	statusFilter,
	scrollRef,
}: {
	wallets: WalletSchema[];
	statusFilter: WalletStatusFilter;
	scrollRef?: MutableRefObject<number>;
}) {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const filtered = useMemo(() => {
		if (statusFilter === "all") return wallets;
		return wallets.filter((wallet) =>
			statusFilter === "active" ? wallet.isActive : !wallet.isActive,
		);
	}, [wallets, statusFilter]);

	const handleSelect = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/wallets", params: { slug } });
				return;
			}
			navigate({
				to: "/$slug/wallets/$walletId",
				params: { slug, walletId: id },
				resetScroll: false,
			});
		},
		[navigate, slug],
	);

	const renderGroupHeader = useCallback(
		(groupKey: WalletTypeSchema, items: WalletSchema[]) => (
			<WalletGroupHeader type={groupKey} total={items.length} />
		),
		[],
	);

	const renderRow = useCallback(
		(item: WalletSchema, _isSelected: boolean) => <WalletContent {...item} />,
		[],
	);

	return (
		<GroupedVirtualTable<WalletSchema, WalletTypeSchema>
			items={filtered}
			getItemId={(wallet) => wallet.id}
			groupBy={(wallet) => wallet.type}
			groupOrder={WALLET_TYPE_ORDER}
			renderGroupHeader={renderGroupHeader}
			columns={columns}
			gridTemplate={GRID_TEMPLATE}
			estimateRowSize={45}
			onSelectItem={handleSelect}
			enableKeyboardNav={true}
			scrollPositionRef={scrollRef}
			emptyState={emptyStates[statusFilter]}
			label="Wallets"
			renderRow={renderRow}
		/>
	);
}

export default memo(WalletList);
