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
		<div className={cn("relative flex w-full flex-1 flex-col gap-8 p-8 md:h-[100vh]", className)}>
			{breadcrumb && <div className="pb-4">{breadcrumb}</div>}
			{children}
		</div>
	);
}
