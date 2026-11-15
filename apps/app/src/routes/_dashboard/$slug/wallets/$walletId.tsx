import { CaretDownIcon, CaretUpIcon, TrashIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffectEvent, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { deleteWalletDialog } from "#app/atoms/index.ts";
import { WalletEditForm } from "#app/components/wallets/wallet-edit.tsx";
import { walletsQueryOptions } from "#app/services/query-options.ts";

import type { WalletSchema } from "#app/lib/schema.ts";

export const Route = createFileRoute("/_dashboard/$slug/wallets/$walletId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { walletId } = Route.useParams();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	const currentIndex = wallets.findIndex((wallet) => wallet.id === walletId);
	const current = currentIndex >= 0 ? wallets[currentIndex] : undefined;

	const walletsRef = useRef(wallets);
	walletsRef.current = wallets;
	const slugRef = useRef(slug);
	slugRef.current = slug;

	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const pendingRef = useRef<"up" | "down" | null>(null);

	const flushNav = useEffectEvent(() => {
		const list = walletsRef.current;
		const s = slugRef.current;
		const idx = list.findIndex((wallet) => wallet.id === walletId);
		if (idx < 0) return;
		const targetIdx = pendingRef.current === "down" ? idx + 1 : idx - 1;
		const target = list[targetIdx];
		if (!target) return;
		navigate({
			to: "/$slug/wallets/$walletId",
			params: { slug: s, walletId: target.id },
			replace: true,
		});
		pendingRef.current = null;
	});

	const debouncedNav = useEffectEvent((direction: "up" | "down") => {
		pendingRef.current = direction;
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(flushNav, 60);
	});

	const handleGoUp = useCallback(() => debouncedNav("up"), []);
	const handleGoDown = useCallback(() => debouncedNav("down"), []);
	const handleClose = useCallback(() => {
		navigate({ to: "/$slug/wallets", params: { slug } });
	}, [navigate, slug]);

	useHotkeys("j", handleGoDown, [handleGoDown]);
	useHotkeys("k", handleGoUp, [handleGoUp]);
	useHotkeys("esc", handleClose, [handleClose]);

	if (!current) return null;

	return (
		<div className="bg-card overflow-auto max-md:h-auto md:h-[calc(100dvh-94px)]">
			<WalletEditForm
				key={current.id}
				wallet={current}
				onClose={handleClose}
				headerActions={
					<WalletHeaderActions
						wallet={current}
						onGoUp={handleGoUp}
						onGoDown={handleGoDown}
						canGoUp={currentIndex > 0}
						canGoDown={currentIndex < wallets.length - 1}
					/>
				}
			/>
		</div>
	);
}

function WalletHeaderActions(props: {
	wallet: WalletSchema;
	onGoUp: () => void;
	onGoDown: () => void;
	canGoUp: boolean;
	canGoDown: boolean;
}) {
	const setDeleteDialog = deleteWalletDialog.set;

	return (
		<>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							size="icon-sm"
							variant="outline"
							onClick={props.onGoDown}
							disabled={!props.canGoDown}
						/>
					}
				>
					<CaretDownIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Down (J)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							size="icon-sm"
							variant="outline"
							onClick={props.onGoUp}
							disabled={!props.canGoUp}
						/>
					}
				>
					<CaretUpIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Up (K)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							size="icon-sm"
							variant="outline"
							aria-label="Delete wallet"
							onClick={() => setDeleteDialog({ state: true, data: { id: props.wallet.id } })}
						/>
					}
				>
					<TrashIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Delete</TooltipContent>
			</Tooltip>
		</>
	);
}
