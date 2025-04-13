import { selectedCategoryAtom } from "@/atoms";
import { DataTable } from "@/components/data-table";
import { createCategoryTheme } from "@/helpers/colors";
import type { CategorySchema } from "@/lib/schema";
import { Badge } from "@hoalu/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";
import { useAtom } from "jotai";

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
	const initRowSelection = selected.id
		? {
				[selected.id]: true,
			}
		: {};

	function handleRowClick<T extends (typeof data)[number]>(rows: T[]) {
		const row = rows[0];
		setSelected({
			id: row ? row.id : undefined,
			name: row ? row.name : undefined,
		});
	}

	return (
		<DataTable
			data={data}
			columns={columns}
			onRowClick={handleRowClick}
			initialState={{
				rowSelection: initRowSelection,
			}}
		/>
	);
}
