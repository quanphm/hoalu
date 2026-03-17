import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { expenseCollectionFactory, walletCollectionFactory } from "#app/lib/collections/index.ts";
import { count, eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

export function useLiveQueryWallets() {
	const workspace = useWorkspace();
	const walletCollection = walletCollectionFactory(workspace.slug);
	const expenseCollection = expenseCollectionFactory(workspace.slug);

	const memberMap = useMemo(() => {
		const map = new Map<string, { id: string; name: string }>();
		for (const member of workspace.members) {
			map.set(member.userId, { id: member.userId, name: member.user.name });
		}
		return map;
	}, [workspace.members]);

	const { data } = useLiveQuery(
		(q) => {
			return q
				.from({ wallet: walletCollection })
				.leftJoin({ expense: expenseCollection }, ({ wallet, expense }) =>
					eq(wallet.id, expense.wallet_id),
				)
				.groupBy(({ wallet }) => [
					wallet.id,
					wallet.name,
					wallet.description,
					wallet.currency,
					wallet.type,
					wallet.is_active,
					wallet.owner_id,
				])
				.select(({ wallet }) => ({
					id: wallet.id,
					name: wallet.name,
					description: wallet.description,
					currency: wallet.currency,
					type: wallet.type,
					isActive: wallet.is_active,
					ownerId: wallet.owner_id,
					total: count(wallet.id),
				}));
		},
		[workspace.slug],
	);

	return useMemo(() => {
		if (!data) return [];
		return data
			.map((wallet) => ({
				...wallet,
				owner: memberMap.get(wallet.ownerId) ?? { id: wallet.ownerId, name: "Unknown" },
			}))
			.sort((a, b) => b.total - a.total);
	}, [data, memberMap]);
}

type SyncedWallets = ReturnType<typeof useLiveQueryWallets>;
export type SyncedWallet = SyncedWallets[number];
