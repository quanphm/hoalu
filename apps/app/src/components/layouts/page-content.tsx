import { cn } from "@hoalu/ui/utils";

export function PageContent({
	header,
	children,
	className,
}: { header?: React.ReactNode; className?: string; children: React.ReactNode }) {
	return (
		<>
			{header && <header className="max-w-full px-6 py-4">{header}</header>}
			<div className={cn("flex h-[100vh] max-w-full flex-1 flex-col gap-4 p-6", className)}>
				{children}
			</div>
		</>
	);
}
