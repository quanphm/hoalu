import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom } from "jotai";

import { Checkbox } from "@hoalu/ui/checkbox";
import { Label } from "@hoalu/ui/label";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { expenseCategoryFilterAtom } from "@/atoms";
import { categoriesQueryOptions } from "@/services/query-options";

const workspaceRouteApi = getRouteApi("/_dashboard/$slug");

export function ExpenseCategoryFilter() {
	const { slug } = workspaceRouteApi.useParams();
	const [selectedIds, setSelectedIds] = useAtom(expenseCategoryFilterAtom);
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));

	return (
		<div className="flex flex-col gap-2.5">
			<div className="flex items-center justify-between px-1 font-semibold text-sm">Categories</div>
			<div className="rounded-md border">
				<ScrollArea className="h-[180px]">
					<div className="divide-y divide-border/60">
						{categories.map((c) => {
							const active = selectedIds.includes(c.id);
							return (
								<Label
									key={c.id}
									htmlFor={c.id}
									className="flex w-full flex-row items-center gap-2 p-2 text-xs outline-none hover:bg-muted/50"
								>
									<Checkbox
										id={c.id}
										checked={active}
										onCheckedChange={() => {
											setSelectedIds(
												active ? selectedIds.filter((id) => id !== c.id) : [...selectedIds, c.id],
											);
										}}
									/>
									{c.name}
								</Label>
							);
						})}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
