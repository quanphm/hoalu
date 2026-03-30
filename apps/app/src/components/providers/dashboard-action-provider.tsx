import { redactedAmountAtom } from "#app/atoms/index.ts";
import {
	AVAILABLE_WORKSPACE_SHORTCUT,
	KEYBOARD_SHORTCUTS,
	THEMES,
} from "#app/helpers/constants.ts";
import { useTheme } from "#app/hooks/use-theme.ts";
import { listWorkspacesOptions } from "#app/services/query-options.ts";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

/**
 * All global actions that can be use in "/_dashboard" route.
 */
export function DashboardActionProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const { mode, setTheme } = useTheme();
	const setRedacted = useSetAtom(redactedAmountAtom);
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
				console.error(error);
			}
		},
		{
			enabled: workspaces && workspaces.length > 0,
		},
		[workspaces, workspaces?.length],
	);

	useHotkeys(KEYBOARD_SHORTCUTS.goto_home.hotkey, () => {
		navigate({ to: "/" });
	});

	useHotkeys(
		KEYBOARD_SHORTCUTS.toggle_theme.hotkey,
		() => {
			const currentThemeIndex = THEMES.indexOf(mode);
			const nextThemeIndex = (currentThemeIndex + 1) % THEMES.length;
			setTheme(THEMES[nextThemeIndex]);
		},
		{
			enabled: KEYBOARD_SHORTCUTS.toggle_theme.enabled,
		},
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.toggle_redacted.hotkey,
		() => {
			setRedacted((value) => !value);
		},
		{
			enabled: KEYBOARD_SHORTCUTS.toggle_redacted.enabled,
			useKey: true,
		},
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_preferences.hotkey,
		() => {
			navigate({ to: "/account/preferences" });
		},
		{
			enabled: KEYBOARD_SHORTCUTS.goto_preferences.enabled,
		},
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_tokens.hotkey,
		() => {
			navigate({ to: "/account/tokens" });
		},
		{
			enabled: KEYBOARD_SHORTCUTS.goto_tokens.enabled,
		},
	);

	return children;
}
