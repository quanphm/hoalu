import { cn } from "@hoalu/ui/utils";

export function PageContent({
	breadcrumb,
	children,
	className,
	fill = false,
}: {
	breadcrumb?: React.ReactNode;
	/** Fill the page and let the content scroll inside it, instead of the page scrolling. */
	fill?: boolean;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"relative flex w-full flex-1 flex-col gap-0 p-0",
				// A filling page is pinned to the viewport so its child list owns the scroll; otherwise it grows
				// with its content. Clamping a non-filling page would strand overflow shorter than the inset.
				fill && "max-md:min-h-0",
				className,
			)}
		>
			{breadcrumb && <div className="pb-4">{breadcrumb}</div>}
			{children}
		</div>
	);
}
