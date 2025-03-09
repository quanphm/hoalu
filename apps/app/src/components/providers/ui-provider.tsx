import { Toaster } from "@hoalu/ui/sonner";
import { TooltipProvider } from "@hoalu/ui/tooltip";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function UiProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
			<TooltipProvider delayDuration={3000}>
				{children}
				<Toaster />
			</TooltipProvider>
		</NextThemesProvider>
	);
}
