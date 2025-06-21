import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@hoalu/ui/sonner";
import { TooltipProvider } from "@hoalu/ui/tooltip";
import { THEMES } from "@/helpers/constants";

export function UiProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			themes={THEMES}
			defaultTheme={THEMES[1]}
			attribute="class"
			disableTransitionOnChange
		>
			<TooltipProvider>
				{children}
				<Toaster />
			</TooltipProvider>
		</NextThemesProvider>
	);
}
