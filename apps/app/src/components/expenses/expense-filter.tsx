import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom } from "jotai";

import { Checkbox } from "@hoalu/ui/checkbox";
import { Label } from "@hoalu/ui/label";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import {
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
} from "@/atoms";
import { AVAILABLE_REPEAT_OPTIONS } from "@/helpers/constants";
import { useExpenseStats } from "@/hooks/use-expenses";
import type { RepeatSchema, WalletTypeSchema } from "@/lib/schema";
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
			<div className="flex flex-col gap-2 pt-1">
				<ExpenseSearch />
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">Date Range</div>
				<ExpenseCalendar />
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">Categories</div>
				<div className="rounded-md border border-border/80">
					<ScrollAreaWithCondition enabled={categories.length > 5}>
						{categories.map((c) => (
							<CategoryCheckboxGroup key={c.id} id={c.id} name={c.name} />
						))}
					</ScrollAreaWithCondition>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">Wallets</div>
				<div className="rounded-md border border-border/80">
					<ScrollAreaWithCondition enabled={wallets.length > 5}>
						{wallets.map((w) => (
							<WalletCheckboxGroup key={w.id} id={w.id} name={w.name} type={w.type} />
						))}
					</ScrollAreaWithCondition>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">Repeat</div>
				<div className="rounded-md border border-border/80">
					<ScrollAreaWithCondition enabled={false}>
						{AVAILABLE_REPEAT_OPTIONS.map((w) => (
							<RepeatCheckboxGroup key={w.value} id={w.value} name={w.label} />
						))}
					</ScrollAreaWithCondition>
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
				<span className="max-w-[100px] truncate">{props.name}</span>
			</div>
			<span className="text-muted-foreground">{stats.transactions.byCategory[props.id] || 0}</span>
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
			<span className="text-muted-foreground">{stats.transactions.byWallet[props.id] || 0}</span>
		</Label>
	);
}

function RepeatCheckboxGroup(props: { id: RepeatSchema; name: string }) {
	const stats = useExpenseStats();
	const [selected, setSelected] = useAtom(expenseRepeatFilterAtom);

	const onChange = (checked: boolean | "indeterminate") =>
		setSelected((prev) => {
			if (checked === true) {
				return prev.includes(props.id) ? prev : [...prev, props.id];
			}
			return prev.filter((id) => id !== props.id);
		});

	const active = selected.includes(props.id);

	return (
		<Label
			htmlFor={props.id}
			className="flex w-full items-center justify-between py-2 pr-4 pl-2 text-xs outline-none hover:bg-muted/50"
		>
			<div className="flex items-center gap-2">
				<Checkbox id={props.id} checked={active} onCheckedChange={onChange} />
				<span className="max-w-[100px] truncate">{props.name}</span>
			</div>
			<span className="text-muted-foreground">{stats.transactions.byRepeat[props.id] || 0}</span>
		</Label>
	);
}

function ScrollAreaWithCondition({
	enabled,
	children,
}: {
	enabled: boolean;
	children: React.ReactNode;
}) {
	if (enabled) {
		return (
			<ScrollArea className="h-[142px]">
				<div className="divide-y divide-border/60">{children}</div>
			</ScrollArea>
		);
	}
	return <div className="divide-y divide-border/60">{children}</div>;
}
