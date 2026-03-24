import { cn } from "@hoalu/ui/utils";

export function PageContent({
	breadcrumb,
	children,
	className,
}: {
	breadcrumb?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn("relative flex w-full flex-1 flex-col gap-4 p-6 md:gap-8 md:px-8", className)}
		>
			{breadcrumb && <div className="pb-4">{breadcrumb}</div>}
			{children}
		</div>
	);
}
