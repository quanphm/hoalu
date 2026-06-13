import { cn } from "@hoalu/ui/utils";

interface DashboardLayoutProps {
	main: React.ReactNode;
	sidebar: React.ReactNode;
	className?: string;
}

export function DashboardLayout({ main, sidebar, className }: DashboardLayoutProps) {
	return (
		<div className={cn("flex flex-col lg:flex-row", className)}>
			<main className="min-w-0 flex-1 gap-4 p-4">{main}</main>
			<aside className="hidden flex-col gap-4 py-4 pr-4 lg:flex lg:w-90 xl:w-100">{sidebar}</aside>
		</div>
	);
}
