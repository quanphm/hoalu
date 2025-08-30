import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Theme({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider defaultTheme="light" attribute="class" disableTransitionOnChange>
			{children}
		</NextThemesProvider>
	);
}
