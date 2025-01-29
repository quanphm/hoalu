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
			{breadcrumb && (
				<div className="max-w-full border-border border-b px-6 py-4">{breadcrumb}</div>
			)}
			<div className={cn("flex h-[100vh] max-w-full flex-1 flex-col gap-6 p-6", className)}>
				{children}
			</div>
		</>
	);
}
