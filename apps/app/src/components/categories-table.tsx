import { selectedCategoryAtom } from "@/atoms/category";
import { DataTable } from "@/components/data-table";
import { createCategoryTheme } from "@/helpers/colors";
import type { CategorySchema } from "@/lib/schema";
import { Badge } from "@hoalu/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";
import { useSetAtom } from "jotai";

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
				"w-(--header-category-size) min-w-(--header-category-size) max-w-(--header-category-size)",
			cellClassName:
				"w-(--col-category-size) min-w-(--col-category-size) max-w-(--col-category-size)",
		},
	}),
	columnHelper.accessor("description", {
		header: "Description",
		cell: (info) => info.getValue(),
	}),
];

export function CategoriesTable({ data }: { data: CategorySchema[] }) {
	const setSelected = useSetAtom(selectedCategoryAtom);

	return (
		<DataTable
			data={data}
			columns={columns}
			enableMultiRowSelection={false}
			enablePagination={false}
			onRowClick={(row) =>
				setSelected({
					id: row.original.id,
					name: row.original.name,
				})
			}
		/>
	);
}
