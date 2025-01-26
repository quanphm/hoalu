import { cn } from "@hoalu/ui/utils";

export function PageContent({
	breadcrumb,
	header,
	children,
	className,
}: {
	breadcrumb?: React.ReactNode;
	header?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<>
			{breadcrumb && (
				<div className="max-w-full border-border border-b px-6 py-4">{breadcrumb}</div>
			)}
			{header && <header className="max-w-full px-6 py-6">{header}</header>}
			<div className={cn("flex h-[100vh] max-w-full flex-1 flex-col gap-4 p-6 pt-0", className)}>
				{children}
			</div>
		</>
	);
}
