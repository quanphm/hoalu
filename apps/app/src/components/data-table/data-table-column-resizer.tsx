import type { Header } from "@tanstack/react-table";

import { cn } from "@hoalu/ui/utils";

export function ColumnResizer({ header }: { header: Header<any, unknown> }) {
	if (header.column.getCanResize() === false)
		return <div className="absolute top-0 right-0 h-full w-px bg-border" />;

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
				"absolute top-0 right-0 h-full w-px cursor-col-resize bg-border group-hover:w-2 group-hover:bg-border",
				header.column.getIsResizing() && "w-2 bg-blue-700 group-hover:bg-blue-700",
			)}
		/>
	);
}
