import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

const isServer = typeof window === "undefined";
const THEME_FAMILIES = ["default", "creamy", "deluge"] as const;
const THEME_FAMILY_KEY = "theme-family";

type ThemeFamily = (typeof THEME_FAMILIES)[number];

export function useTheme() {
	const { theme } = useNextTheme();
	const [themeFamily, setThemeFamilyState] = useState<ThemeFamily>(() => getTheme());

	const setThemeFamily = (family: ThemeFamily) => {
		setThemeFamilyState(family);
		localStorage.setItem(THEME_FAMILY_KEY, family);
		document.documentElement.setAttribute("data-theme", themeFamily);
	};

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", themeFamily);
	}, [themeFamily]);

	return { themeFamily, setThemeFamily, mode: theme };
}

const getTheme = () => {
	if (isServer) {
		return "default";
	}

	let theme: ThemeFamily = "default";

	try {
		theme = localStorage.getItem(THEME_FAMILY_KEY) as ThemeFamily;
	} catch (_error) {}

	return theme;
};
