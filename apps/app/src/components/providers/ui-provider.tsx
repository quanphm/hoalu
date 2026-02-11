import { THEMES } from "#app/helpers/constants.ts";
import { ToastProvider } from "@hoalu/ui/toast";
import { TooltipProvider } from "@hoalu/ui/tooltip";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function UiProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			themes={[...THEMES]}
			defaultTheme="light"
			attribute="class"
			disableTransitionOnChange
		>
			<TooltipProvider>
				<ToastProvider>{children}</ToastProvider>
			</TooltipProvider>
		</NextThemesProvider>
	);
}
