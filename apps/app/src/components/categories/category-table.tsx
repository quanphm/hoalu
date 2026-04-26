import { selectedCategoryAtom } from "#app/atoms/index.ts";
import { EditCategoryForm } from "#app/components/categories/category-actions.tsx";
import { DataTable } from "#app/components/data-table/index.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { Frame, FramePanel } from "@hoalu/ui/frame";
import { createColumnHelper } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { Suspense } from "react";

import type { CategorySchema } from "#app/lib/schema.ts";

type CategoryTableItem = Omit<CategorySchema, "total">;

const columnHelper = createColumnHelper<CategoryTableItem>();

const columns = [
	columnHelper.accessor("name", {
		header: "Category",
		cell: (info) => {
			const value = info.getValue();
			const className = createCategoryTheme(info.row.original.color);
			return (
				<Badge className={className} size="sm">
					{value}
				</Badge>
			);
		},
		meta: {
			headerClassName: "w-(--category-size) min-w-(--category-size) max-w-(--category-size)",
			cellClassName: "w-(--category-size) min-w-(--category-size) max-w-(--category-size)",
		},
	}),
	columnHelper.accessor("description", {
		header: "Description",
		cell: (info) => info.getValue(),
	}),
];

export function CategoryTable({ data }: { data: CategoryTableItem[] }) {
	const [selected, setSelected] = useAtom(selectedCategoryAtom);
	const initRowSelection = selected.id ? { [selected.id]: true } : {};

	function handleRowClick<T extends (typeof data)[number]>(rows: T[]) {
		const row = rows[0];
		setSelected({
			id: row ? row.id : null,
			name: row ? row.name : null,
		});
	}

	return (
		<>
			<div className="sm:col-span-8">
				<DataTable
					data={data}
					columns={columns}
					onRowClick={handleRowClick}
					controlledState={{
						rowSelection: initRowSelection,
					}}
				/>
			</div>
			<div className="max-h-fit sm:col-span-4">
				<FramePanel>
					{selected.id ? (
						<Suspense>
							<EditCategoryForm key={selected.id} />
						</Suspense>
					) : (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>No details yet</EmptyTitle>
								<EmptyDescription>Select a category on the left to edit details.</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
				</FramePanel>
			</div>
		</>
	);
}
