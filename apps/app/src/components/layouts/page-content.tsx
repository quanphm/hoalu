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
			<div
				className={cn(
					"mx-auto flex h-[100vh] w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10",
					className,
				)}
			>
				{breadcrumb && <div className="pb-4">{breadcrumb}</div>}
				{children}
			</div>
		</>
	);
}
