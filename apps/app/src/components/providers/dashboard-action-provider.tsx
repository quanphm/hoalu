import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";

import { AVAILABLE_WORKSPACE_SHORTCUT, KEYBOARD_SHORTCUTS, THEMES } from "@/helpers/constants";
import { listWorkspacesOptions } from "@/services/query-options";

/**
 * All global actions that can be use in "/_dashboard" route.
 */
export function DashboardActionProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const { data: workspaces } = useQuery(listWorkspacesOptions());

	useHotkeys(
		AVAILABLE_WORKSPACE_SHORTCUT,
		(e) => {
			if (!workspaces || !workspaces.length) {
				return;
			}
			try {
				const idx = Number.parseInt(e.key, 10) - 1;
				if (idx >= workspaces.length) {
					return;
				}
				const ws = workspaces[idx];
				if (ws) {
					navigate({ to: "/$slug", params: { slug: ws.slug } });
				}
			} catch (error) {
				console.log(error);
			}
		},
		{
			description: "Navigate: Workspaces",
			enabled: workspaces && workspaces.length > 0,
		},
		[workspaces, workspaces?.length],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_home.hotkey,
		() => {
			navigate({ to: "/" });
		},
		{ description: "Navigate: Home" },
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.toggle_theme.hotkey,
		() => {
			const currentThemeIndex = THEMES.indexOf(theme as any);
			const nextThemeIndex = (currentThemeIndex + 1) % THEMES.length;
			setTheme(THEMES[nextThemeIndex]);
		},
		{ description: "Theme: Cycle through themes" },
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_preferences.hotkey,
		() => {
			navigate({ to: "/account/preferences" });
		},
		{
			description: "Navigate: Preferences",
			enabled: KEYBOARD_SHORTCUTS.goto_preferences.enabled,
		},
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_tokens.hotkey,
		() => {
			navigate({ to: "/account/tokens" });
		},
		{
			description: "Navigate: Tokens",
			enabled: KEYBOARD_SHORTCUTS.goto_tokens.enabled,
		},
	);

	return children;
}
