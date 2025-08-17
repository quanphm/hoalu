import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
	createCategoryDialogOpenAtom,
	createExpenseDialogOpenAtom,
	createWalletDialogOpenAtom,
	draftExpenseAtom,
	openingDialogsAtom,
} from "@/atoms";
import { CreateCategoryDialog } from "@/components/category-actions";
import { CreateExpenseDialog } from "@/components/expenses/expense-actions";
import { CreateWalletDialog } from "@/components/wallets/wallet-actions";
import { AVAILABLE_WORKSPACE_SHORTCUT, KEYBOARD_SHORTCUTS, THEMES } from "@/helpers/constants";
import { listWorkspacesOptions } from "@/services/query-options";

/**
 * Registry keyboard shortcuts & global dialogs
 */
export function ActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = useParams({ strict: false });
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const { data: workspaces } = useQuery(listWorkspacesOptions());

	const openedDialogs = useAtomValue(openingDialogsAtom);
	const isAnyDialogOpen = openedDialogs.length > 0;
	const isAllowShortcutNavigateInWorkspace = !!slug && !isAnyDialogOpen;

	const setExpenseDraft = useSetAtom(draftExpenseAtom);
	useEffect(() => {
		if (slug) {
			setExpenseDraft(RESET);
		}
	}, [slug, setExpenseDraft]);

	const setExpenseOpen = useSetAtom(createExpenseDialogOpenAtom);
	const setWalletOpen = useSetAtom(createWalletDialogOpenAtom);
	const setCategoryOpen = useSetAtom(createCategoryDialogOpenAtom);

	useHotkeys(
		AVAILABLE_WORKSPACE_SHORTCUT,
		(data) => {
			if (!workspaces || !workspaces.length) {
				return;
			}
			try {
				const idx = Number.parseInt(data.key, 10) - 1;
				if (idx > workspaces.length - 1) {
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
			enabled: workspaces && workspaces.length > 0 && !!slug === false,
		},
		[workspaces, workspaces?.length, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_home.hotkey,
		() => {
			navigate({ to: "/" });
		},
		{ description: "Navigate: Home" },
		[navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.toggle_theme.hotkey,
		() => {
			const currentThemeIndex = THEMES.indexOf(theme ?? THEMES[0]);
			const nextThemeIndex = (currentThemeIndex + 1) % THEMES.length;
			setTheme(THEMES[nextThemeIndex]);
		},
		{ description: "Theme: Browse themes" },
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_expense.hotkey,
		() => {
			setExpenseOpen(true);
		},
		{ preventDefault: true, description: "Dialog: Create new expense", enabled: !!slug },
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_wallet.hotkey,
		() => {
			setWalletOpen(true);
		},
		{ preventDefault: true, description: "Dialog: Create new wallet", enabled: !!slug },
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_category.hotkey,
		() => {
			setCategoryOpen(true);
		},
		{ preventDefault: true, description: "Dialog: Create new category", enabled: !!slug },
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_dashboard.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug", params: { slug } });
			}
		},
		{ description: "Navigate: Dashboard", enabled: isAllowShortcutNavigateInWorkspace },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_expenses.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/expenses", params: { slug } });
			}
		},
		{
			description: "Navigate: Expenses",
			enabled: isAllowShortcutNavigateInWorkspace && KEYBOARD_SHORTCUTS.goto_expenses.enabled,
		},
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_tasks.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/tasks", params: { slug } });
			}
		},
		{
			description: "Navigate: Tasks",
			enabled: isAllowShortcutNavigateInWorkspace && KEYBOARD_SHORTCUTS.goto_tasks.enabled,
		},
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_workspace.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/settings/workspace", params: { slug } });
			}
		},
		{
			description: "Navigate: Settings / Workspace",
			enabled: isAllowShortcutNavigateInWorkspace && KEYBOARD_SHORTCUTS.goto_workspace.enabled,
		},
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_members.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/settings/members", params: { slug } });
			}
		},
		{
			description: "Navigate: Settings / Members",
			enabled: isAllowShortcutNavigateInWorkspace && KEYBOARD_SHORTCUTS.goto_members.enabled,
		},
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_library.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/settings/library", params: { slug } });
			}
		},
		{
			description: "Navigate: Settings / Library",
			enabled: isAllowShortcutNavigateInWorkspace && KEYBOARD_SHORTCUTS.goto_library.enabled,
		},
		[slug, navigate],
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
		[navigate],
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
		[navigate],
	);

	return (
		<CreateExpenseDialog>
			<CreateWalletDialog>
				<CreateCategoryDialog>{children}</CreateCategoryDialog>
			</CreateWalletDialog>
		</CreateExpenseDialog>
	);
}
