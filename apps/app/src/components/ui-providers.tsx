import { TooltipProvider } from "@hoalu/ui/tooltip";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function UiProviders({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
			<TooltipProvider>{children}</TooltipProvider>
		</NextThemesProvider>
	);
}
