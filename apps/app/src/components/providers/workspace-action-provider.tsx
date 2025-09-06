import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
	createCategoryDialogAtom,
	createExpenseDialogAtom,
	createWalletDialogAtom,
	dialogStateAtom,
	draftExpenseAtom,
} from "@/atoms";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";

const routeApi = getRouteApi("/_dashboard/$slug");

/**
 * All global actions that can be use in "/_dashboard/$slug" route.
 */
export function WorkspaceActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();

	const isAnyDialogOpen = useAtomValue(dialogStateAtom);
	const allowShortcutNavigate = !isAnyDialogOpen;

	const setExpenseDraft = useSetAtom(draftExpenseAtom);
	useEffect(() => {
		if (slug) {
			setExpenseDraft(RESET);
		}
	}, [slug, setExpenseDraft]);

	const setExpenseOpen = useSetAtom(createExpenseDialogAtom);
	const setWalletOpen = useSetAtom(createWalletDialogAtom);
	const setCategoryOpen = useSetAtom(createCategoryDialogAtom);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_expense.hotkey,
		() => {
			setExpenseOpen({ state: true });
		},
		{
			preventDefault: true,
			description: "Dialog: Create new expense",
		},
		[],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_wallet.hotkey,
		() => {
			setWalletOpen({ state: true });
		},
		{
			preventDefault: true,
			description: "Dialog: Create new wallet",
		},
		[],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_category.hotkey,
		() => {
			setCategoryOpen({ state: true });
		},
		{
			preventDefault: true,
			description: "Dialog: Create new category",
		},
		[],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_dashboard.hotkey,
		() => {
			navigate({ to: "/$slug", params: { slug } });
		},
		{ description: "Navigate: Dashboard", enabled: allowShortcutNavigate },
		[slug, allowShortcutNavigate],
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
		[slug, allowShortcutNavigate],
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
		[slug, allowShortcutNavigate],
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
		[slug, allowShortcutNavigate],
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
		[slug, allowShortcutNavigate],
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
		[slug, allowShortcutNavigate],
	);

	return children;
}
