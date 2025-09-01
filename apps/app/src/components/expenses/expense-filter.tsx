import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom } from "jotai";

import { Button } from "@hoalu/ui/button";
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
const expenseRouteApi = getRouteApi("/_dashboard/$slug/expenses");

export function ExpenseFilter() {
	const { slug } = workspaceRouteApi.useParams();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const stats = useExpenseStats();

	return (
		<div className="flex flex-col gap-4.5">
			<div className="flex flex-col gap-2 pt-1">
				<ExpenseSearch />
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">
					<span>Date Range</span>
					<DateRangeClearButton />
				</div>
				<ExpenseCalendar />
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">
					<span>Categories</span>
					<CategoriesClearButton />
				</div>
				<div className="rounded-md border border-border/80">
					<ScrollAreaWithCondition enabled={categories.length > 5}>
						{categories.map((c) => (
							<CategoryCheckboxGroup
								key={c.id}
								id={c.id}
								name={c.name}
								stats={stats.transactions.byCategory[c.id] ?? 0}
							/>
						))}
					</ScrollAreaWithCondition>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">
					<span>Wallets</span>
					<WalletsClearButton />
				</div>
				<div className="rounded-md border border-border/80">
					<ScrollAreaWithCondition enabled={wallets.length > 5}>
						{wallets.map((w) => (
							<WalletCheckboxGroup
								key={w.id}
								id={w.id}
								name={w.name}
								type={w.type}
								stats={stats.transactions.byWallet[w.id] ?? 0}
							/>
						))}
					</ScrollAreaWithCondition>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-1 text-sm">
					<span>Repeat</span>
					<RepeatClearButton />
				</div>
				<div className="rounded-md border border-border/80">
					<ScrollAreaWithCondition enabled={false}>
						{AVAILABLE_REPEAT_OPTIONS.map((r) => (
							<RepeatCheckboxGroup
								key={r.value}
								id={r.value}
								name={r.label}
								stats={stats.transactions.byRepeat[r.value] ?? 0}
							/>
						))}
					</ScrollAreaWithCondition>
				</div>
			</div>
		</div>
	);
}

function DateRangeClearButton() {
	const { date } = expenseRouteApi.useSearch();
	const navigate = expenseRouteApi.useNavigate();

	if (!date) {
		return null;
	}

	const handleClear = () => {
		navigate({
			search: (state) => ({
				...state,
				date: undefined,
			}),
		});
	};

	return (
		<Button
			variant="ghost"
			className="h-auto p-0 text-muted-foreground text-xs transition-colors hover:text-foreground"
			size="sm"
			onClick={handleClear}
		>
			clear
		</Button>
	);
}

function CategoryCheckboxGroup(props: { id: string; name: string; stats: number }) {
	const [selectedIds, setSelectedIds] = useAtom(expenseCategoryFilterAtom);

	const onChange = (checked: boolean | "indeterminate") =>
		setSelectedIds((state) => {
			if (checked === true) {
				return state.includes(props.id) ? state : [...state, props.id];
			}
			return state.filter((id) => id !== props.id);
		});

	const active = selectedIds.includes(props.id);

	return (
		<Label
			htmlFor={`category-${props.id}`}
			className="flex w-full items-center justify-between py-2 pr-4 pl-2 text-xs outline-none hover:bg-muted/50"
		>
			<div className="flex items-center gap-2">
				<Checkbox id={`category-${props.id}`} checked={active} onCheckedChange={onChange} />
				<span className="max-w-[100px] truncate">{props.name}</span>
			</div>
			<span className="text-muted-foreground">{props.stats}</span>
		</Label>
	);
}

function CategoriesClearButton() {
	const [selectedCategories, setSelectedCategories] = useAtom(expenseCategoryFilterAtom);

	if (selectedCategories.length === 0) {
		return null;
	}

	const handleClear = () => {
		setSelectedCategories([]);
	};

	return (
		<Button
			variant="ghost"
			className="h-auto p-0 text-muted-foreground text-xs transition-colors hover:text-foreground"
			size="sm"
			onClick={handleClear}
		>
			clear
		</Button>
	);
}

function WalletCheckboxGroup(props: {
	id: string;
	name: string;
	type: WalletTypeSchema;
	stats: number;
}) {
	const [selectedIds, setSelectedIds] = useAtom(expenseWalletFilterAtom);

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
			htmlFor={`wallet-${props.id}`}
			className="flex w-full items-center justify-between py-2 pr-4 pl-2 text-xs outline-none hover:bg-muted/50"
		>
			<div className="flex items-center gap-2">
				<Checkbox id={`wallet-${props.id}`} checked={active} onCheckedChange={onChange} />
				<WalletLabel name={props.name} type={props.type} />
			</div>
			<span className="text-muted-foreground">{props.stats}</span>
		</Label>
	);
}

function WalletsClearButton() {
	const [selectedWallets, setSelectedWallets] = useAtom(expenseWalletFilterAtom);

	if (selectedWallets.length === 0) {
		return null;
	}

	const handleClear = () => {
		setSelectedWallets([]);
	};

	return (
		<Button
			variant="ghost"
			className="h-auto p-0 text-muted-foreground text-xs transition-colors hover:text-foreground"
			size="sm"
			onClick={handleClear}
		>
			clear
		</Button>
	);
}

function RepeatCheckboxGroup(props: { id: RepeatSchema; name: string; stats: number }) {
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
			htmlFor={`repeat-${props.id}`}
			className="flex w-full items-center justify-between py-2 pr-4 pl-2 text-xs outline-none hover:bg-muted/50"
		>
			<div className="flex items-center gap-2">
				<Checkbox id={`repeat-${props.id}`} checked={active} onCheckedChange={onChange} />
				<span className="max-w-[100px] truncate">{props.name}</span>
			</div>
			<span className="text-muted-foreground">{props.stats}</span>
		</Label>
	);
}

function RepeatClearButton() {
	const [selectedRepeats, setSelectedRepeats] = useAtom(expenseRepeatFilterAtom);

	if (selectedRepeats.length === 0) {
		return null;
	}

	const handleClear = () => {
		setSelectedRepeats([]);
	};

	return (
		<Button
			variant="ghost"
			className="h-auto p-0 text-muted-foreground text-xs transition-colors hover:text-foreground"
			size="sm"
			onClick={handleClear}
		>
			clear
		</Button>
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
