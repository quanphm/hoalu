import type { IncomeClient } from "#app/components/incomes/use-incomes.ts";
import { IncomeContent } from "#app/components/incomes/income-content.tsx";
import { selectedIncomeAtom } from "#app/atoms/income-filters.ts";
import { useAtom } from "jotai";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface Props {
	incomes: IncomeClient[];
}

export function IncomeList({ incomes }: Props) {
	const [selected, setSelected] = useAtom(selectedIncomeAtom);
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: incomes.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60,
	});

	return (
		<div ref={parentRef} className="h-full overflow-auto">
			<div
				style={{
					height: `${virtualizer.getTotalSize()}px`,
					width: "100%",
					position: "relative",
				}}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => {
					const income = incomes[virtualItem.index];
					const isSelected = selected.id === income.id;

					return (
						<div
							key={income.id}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: `${virtualItem.size}px`,
								transform: `translateY(${virtualItem.start}px)`,
							}}
							className={isSelected ? "bg-muted" : ""}
							onClick={() => setSelected({ id: income.id })}
						>
							<IncomeContent income={income} />
						</div>
					);
				})}
			</div>
		</div>
	);
}
