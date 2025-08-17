import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom } from "jotai";

import { Checkbox } from "@hoalu/ui/checkbox";
import { Label } from "@hoalu/ui/label";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { expenseCategoryFilterAtom, expenseWalletFilterAtom } from "@/atoms";
import { useExpenseStats } from "@/hooks/use-expenses";
import type { WalletTypeSchema } from "@/lib/schema";
import { categoriesQueryOptions, walletsQueryOptions } from "@/services/query-options";
import { WalletLabel } from "../wallets/wallet-badge";
import { ExpenseCalendar, ExpenseSearch } from "./expense-actions";

const workspaceRouteApi = getRouteApi("/_dashboard/$slug");

export function ExpenseFilter() {
	const { slug } = workspaceRouteApi.useParams();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2 pt-2">
				<ExpenseSearch />
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">Date Range</div>
				<ExpenseCalendar />
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">Categories</div>
				<div className="rounded-md border border-border/80">
					<ScrollArea className="h-[172px]">
						<div className="divide-y divide-border/60">
							{categories.map((c) => (
								<CategoryCheckboxGroup key={c.id} id={c.id} name={c.name} />
							))}
						</div>
					</ScrollArea>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">Wallets</div>
				<div className="rounded-md border border-border/80">
					<div className="divide-y divide-border/60">
						{wallets.map((w) => (
							<WalletCheckboxGroup key={w.id} id={w.id} name={w.name} type={w.type} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function CategoryCheckboxGroup(props: { id: string; name: string }) {
	const stats = useExpenseStats();
	const [selectedIds, setSelectedIds] = useAtom(expenseCategoryFilterAtom);

	const onChange = (checked: boolean | "indeterminate") =>
		setSelectedIds((prev) => {
			if (checked === true) {
				return prev.includes(props.id) ? prev : [...prev, props.id];
			}
			return prev.filter((id) => id !== props.id);
		});

	const active = !!selectedIds.find((item) => item === props.id);

	return (
		<Label
			htmlFor={props.id}
			className="flex w-full items-center justify-between py-2 pr-4 pl-2 text-xs outline-none hover:bg-muted/50"
		>
			<div className="flex items-center gap-2">
				<Checkbox id={props.id} checked={active} onCheckedChange={onChange} />
				{props.name}
			</div>
			<span className="text-muted-foreground">{stats.transactions.byCategory[props.id]}</span>
		</Label>
	);
}

function WalletCheckboxGroup(props: { id: string; name: string; type: WalletTypeSchema }) {
	const [selectedIds, setSelectedIds] = useAtom(expenseWalletFilterAtom);
	const stats = useExpenseStats();

	const onChange = (checked: boolean | "indeterminate") =>
		setSelectedIds((prev) => {
			if (checked === true) {
				return prev.includes(props.id) ? prev : [...prev, props.id];
			}
			return prev.filter((id) => id !== props.id);
		});

	const active = selectedIds.includes(props.id);

	return (
		<Label
			htmlFor={props.id}
			className="flex w-full items-center justify-between py-2 pr-4 pl-2 text-xs outline-none hover:bg-muted/50"
		>
			<div className="flex items-center gap-2">
				<Checkbox id={props.id} checked={active} onCheckedChange={onChange} />
				<WalletLabel name={props.name} type={props.type} />
			</div>
			<span className="text-muted-foreground">{stats.transactions.byWallet[props.id]}</span>
		</Label>
	);
}
