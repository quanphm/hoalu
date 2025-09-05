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
	isOpeningDialogsAtom,
} from "@/atoms";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";

const routeApi = getRouteApi("/_dashboard/$slug");

/**
 * All global actions that can be use in "/_dashboard/$slug" route.
 */
export function WorkspaceActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();

	const isAnyDialogOpen = useAtomValue(isOpeningDialogsAtom);
	const allowShortcutNavigate = !isAnyDialogOpen;

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
			navigate({ to: "/$slug", params: { slug } });
		},
		{ description: "Navigate: Dashboard", enabled: allowShortcutNavigate },
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_expenses.hotkey,
		() => {
			navigate({ to: "/$slug/expenses", params: { slug } });
		},
		{
			description: "Navigate: Expenses",
			enabled: allowShortcutNavigate && KEYBOARD_SHORTCUTS.goto_expenses.enabled,
		},
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_tasks.hotkey,
		() => {
			navigate({ to: "/$slug/tasks", params: { slug } });
		},
		{
			description: "Navigate: Tasks",
			enabled: allowShortcutNavigate && KEYBOARD_SHORTCUTS.goto_tasks.enabled,
		},
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_workspace.hotkey,
		() => {
			navigate({ to: "/$slug/settings/workspace", params: { slug } });
		},
		{
			description: "Navigate: Settings / Workspace",
			enabled: allowShortcutNavigate && KEYBOARD_SHORTCUTS.goto_workspace.enabled,
		},
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_members.hotkey,
		() => {
			navigate({ to: "/$slug/settings/members", params: { slug } });
		},
		{
			description: "Navigate: Settings / Members",
			enabled: allowShortcutNavigate && KEYBOARD_SHORTCUTS.goto_members.enabled,
		},
		[slug],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_library.hotkey,
		() => {
			navigate({ to: "/$slug/settings/library", params: { slug } });
		},
		{
			description: "Navigate: Settings / Library",
			enabled: allowShortcutNavigate && KEYBOARD_SHORTCUTS.goto_library.enabled,
		},
		[slug],
	);

	return children;
}
