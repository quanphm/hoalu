import { SidebarInset, SidebarProvider } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";
import { useTheme } from "next-themes";
import { AppSidebarLeft } from "./app-sidebar-left";
import { AppSidebarRight } from "./app-sidebar-right";

/**
 * A layout where the sidebar is on the left and content is on the right.
 *
 * @see https://web.dev/patterns/layout/sidebar-says
 */
export function SidebarSaysLayout({ children }: { children: React.ReactNode }) {
	const { theme } = useTheme();

	return (
		<SidebarProvider className={cn(theme)}>
			<AppSidebarLeft />
			<SidebarInset className="max-w-[calc(100%-30rem)] flex-1 overflow-y-auto overflow-x-hidden">
				<header className="max-w-full px-6 py-4">Title</header>
				<div className="flex h-[100vh] max-w-full flex-1 flex-col gap-4 px-6 py-4">{children}</div>
			</SidebarInset>
			<AppSidebarRight />
		</SidebarProvider>
	);
}
