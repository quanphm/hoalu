import { CategoryDropdownMenuWithModal } from "@/components/category";
import { DataTable } from "@/components/data-table";
import { createCategoryTheme } from "@/helpers/colors";
import type { CategorySchema } from "@/lib/schema";
import { Badge } from "@hoalu/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";

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
	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => <CategoryDropdownMenuWithModal id={info.row.original.id} />,
		meta: {
			headerClassName:
				"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
			cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
		},
	}),
];

export function CategoriesTable({ data }: { data: CategorySchema[] }) {
	return <DataTable data={data} columns={columns} />;
}
