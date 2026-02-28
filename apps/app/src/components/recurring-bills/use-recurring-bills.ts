import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { monetary } from "@hoalu/common/monetary";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useAtom } from "jotai";
import { atom } from "jotai";
import { useMemo } from "react";

export const selectedRecurringBillAtom = atom<{ id: string | null }>({ id: null });

export function useSelectedRecurringBill() {
	const [bill, setSelectedBill] = useAtom(selectedRecurringBillAtom);
	const onSelectBill = (id: string | null) => setSelectedBill({ id });
	return { bill, onSelectBill };
}

export function useLiveQueryRecurringBills() {
	const workspace = useWorkspace();
	const collection = recurringBillCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);

	const { data } = useLiveQuery(
		(q) =>
			q
				.from({ bill: collection })
				.innerJoin({ wallet: walletCollection }, ({ bill, wallet }) =>
					eq(bill.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ bill, category }) =>
					eq(bill.category_id, category.id),
				)
				.orderBy(({ bill }) => bill.created_at, "desc")
				.select(({ bill, wallet, category }) => ({
					...bill,
					wallet_name: wallet.name,
					category_name: category?.name ?? null,
					category_color: category?.color ?? null,
				})),
		[workspace.slug],
	);

	return useMemo(() => {
		if (!data) return [];
		return data
			.filter((b) => b.is_active)
			.map((b) => ({
				...b,
				amount: monetary.fromRealAmount(Number(b.amount), b.currency),
				realAmount: Number(b.amount),
			}));
	}, [data]);
}

export type SyncedRecurringBill = ReturnType<typeof useLiveQueryRecurringBills>[number];
