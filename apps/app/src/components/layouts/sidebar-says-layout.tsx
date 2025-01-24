import { SidebarInset, SidebarProvider } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";
import { useTheme } from "next-themes";
import { SidebarLeft } from "./sidebar-left";

/**
 * A layout where the sidebar is on the left and content is on the right.
 *
 * @see https://web.dev/patterns/layout/sidebar-says
 */
export function SidebarSaysLayout({ children }: { children: React.ReactNode }) {
	const { theme } = useTheme();

	return (
		<SidebarProvider className={cn(theme)}>
			<SidebarLeft />
			<SidebarInset>
				<main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
					{/* <header className="mx-auto max-w-7xl py-4">Title</header> */}
					<div className="mx-auto flex max-w-7xl py-4">
						<div className="mb-4 flex flex-col items-start justify-start">{children}</div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
