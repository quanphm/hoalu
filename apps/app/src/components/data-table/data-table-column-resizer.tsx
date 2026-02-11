import { cn } from "@hoalu/ui/utils";
import type { Header } from "@tanstack/react-table";

export function ColumnResizer({ header }: { header: Header<any, unknown> }) {
	if (header.column.getCanResize() === false)
		return <div className="bg-border absolute top-0 right-0 h-full w-px" />;

	return (
		<div
			{...{
				onMouseDown: header.getResizeHandler(),
				onTouchStart: header.getResizeHandler(),
				style: {
					userSelect: "none",
					touchAction: "none",
				},
			}}
			className={cn(
				"bg-border group-hover:bg-border absolute top-0 right-0 h-full w-px cursor-col-resize group-hover:w-2",
				header.column.getIsResizing() && "w-2 bg-blue-700 group-hover:bg-blue-700",
			)}
		/>
	);
}
