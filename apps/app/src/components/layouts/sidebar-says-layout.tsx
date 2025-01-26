import { AppSidebarLeft } from "@/components/layouts/app-sidebar-left";
import { AppSidebarRight } from "@/components/layouts/app-sidebar-right";
import { SidebarInset, SidebarProvider } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";
import { useTheme } from "next-themes";

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
				{children}
			</SidebarInset>
			<AppSidebarRight />
		</SidebarProvider>
	);
}
