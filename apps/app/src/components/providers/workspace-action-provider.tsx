import {
	commandPaletteOpenAtom,
	createCategoryDialogAtom,
	createExpenseDialogAtom,
	createIncomeDialogAtom,
	createRecurringBillDialogAtom,
	createWalletDialogAtom,
	dialogStateAtom,
	draftExpenseAtom,
} from "#app/atoms/index.ts";
import { CommandPalette } from "#app/components/command-palette/index.ts";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

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
	const setIncomeOpen = useSetAtom(createIncomeDialogAtom);
	const setWalletOpen = useSetAtom(createWalletDialogAtom);
	const setCategoryOpen = useSetAtom(createCategoryDialogAtom);
	const setRecurringBillOpen = useSetAtom(createRecurringBillDialogAtom);

	const [commandPaletteOpen, setCommandPaletteOpen] = useAtom(commandPaletteOpenAtom);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_expense.hotkey,
		() => {
			setExpenseOpen({ state: true });
		},
		{
			preventDefault: true,
		},
		[],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_income.hotkey,
		() => {
			setIncomeOpen({ state: true });
		},
		{
			preventDefault: true,
		},
		[],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_recurring_bill.hotkey,
		() => {
			setRecurringBillOpen({ state: true });
		},
		{
			preventDefault: true,
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
		},
		[],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_dashboard.hotkey,
		() => {
			navigate({ to: "/$slug", params: { slug } });
		},
		{ enabled: allowShortcutNavigate },
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_expenses.hotkey,
		() => {
			navigate({ to: "/$slug/transactions", params: { slug } });
		},
		{
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
			enabled: allowShortcutNavigate && KEYBOARD_SHORTCUTS.goto_members.enabled,
		},
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.command_palette.hotkey,
		(e) => {
			e.preventDefault();
			setCommandPaletteOpen((prev) => !prev);
		},
		{
			enabled: KEYBOARD_SHORTCUTS.command_palette.enabled,
			enableOnFormTags: true,
		},
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_categories.hotkey,
		() => {
			navigate({ to: "/$slug/categories", params: { slug } });
		},
		{
			enabled: allowShortcutNavigate,
		},
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_wallets.hotkey,
		() => {
			navigate({ to: "/$slug/wallets", params: { slug } });
		},
		{
			enabled: allowShortcutNavigate,
		},
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_recurring_bills.hotkey,
		() => {
			navigate({ to: "/$slug/recurring-bills", params: { slug } });
		},
		{
			enabled: allowShortcutNavigate,
		},
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_incomes.hotkey,
		() => {
			navigate({ to: "/$slug/incomes", params: { slug } });
		},
		{
			enabled: allowShortcutNavigate,
		},
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_files.hotkey,
		() => {
			navigate({ to: "/$slug/files", params: { slug } });
		},
		{
			enabled: allowShortcutNavigate,
		},
		[slug, allowShortcutNavigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_events.hotkey,
		() => {
			navigate({ to: "/$slug/events", params: { slug } });
		},
		{
			enabled: allowShortcutNavigate,
		},
		[slug, allowShortcutNavigate],
	);

	return (
		<>
			{children}
			<CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
		</>
	);
}
