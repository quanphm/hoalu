import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
	createCategoryDialogOpenAtom,
	createExpenseDialogOpenAtom,
	createWalletDialogOpenAtom,
	draftExpenseAtom,
	openingDialogsAtom,
} from "@/atoms";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";

const routeApi = getRouteApi("/_dashboard/$slug");

/**
 * All global actions that can be use in "/_dashboard/$slug" route.
 */
export function WorkspaceActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();

	const openingDialogs = useAtomValue(openingDialogsAtom);
	const isAnyDialogOpen = openingDialogs.length > 0;
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

	return children;
}
