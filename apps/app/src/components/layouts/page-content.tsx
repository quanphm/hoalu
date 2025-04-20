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
		<>
			<div className={cn("relative flex h-[100vh] w-full flex-1 flex-col gap-10 p-10", className)}>
				{breadcrumb && <div className="pb-4">{breadcrumb}</div>}
				{children}
			</div>
		</>
	);
}
