import { ThemeProvider as NextThemesProvider } from "next-themes";

const THEME_FAMILIES = ["default", "creamy", "deluge"] as const;

export function Theme({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			themes={["light", "dark"]}
			defaultTheme="light"
			attribute="class"
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	);
}
