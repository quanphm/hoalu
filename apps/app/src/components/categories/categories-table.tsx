import { createColumnHelper } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { Suspense } from "react";

import { Badge } from "@hoalu/ui/badge";

import { selectedCategoryAtom } from "#app/atoms/index.ts";
import { EditCategoryForm } from "#app/components/categories/category-actions.tsx";
import { DataTable } from "#app/components/data-table/index.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import type { CategorySchema } from "#app/lib/schema.ts";

const columnHelper = createColumnHelper<CategorySchema>();

const columns = [
	columnHelper.accessor("name", {
		header: "Category",
		cell: (info) => {
			const value = info.getValue();
			const className = createCategoryTheme(info.row.original.color);
			return <Badge className={className}>{value}</Badge>;
		},
		meta: {
			headerClassName:
				"w-(--header-category-name-size) min-w-(--header-category-name-size) max-w-(--header-category-name-size)",
			cellClassName:
				"w-(--col-category-name-size) min-w-(--col-category-name-size) max-w-(--col-category-name-size)",
		},
	}),
	columnHelper.accessor("description", {
		header: "Description",
		cell: (info) => info.getValue(),
	}),
];

export function CategoriesTable({ data }: { data: CategorySchema[] }) {
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
			{selected.id && (
				<div className="flex max-h-fit flex-col gap-4 rounded-md border p-4 sm:col-span-4">
					<Suspense>
						<EditCategoryForm key={selected.id} />
					</Suspense>
				</div>
			)}
		</>
	);
}
