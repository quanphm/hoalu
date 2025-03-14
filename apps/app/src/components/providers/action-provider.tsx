import { createExpenseDialogOpenAtom, createWalletDialogOpenAtom } from "@/atoms/dialogs";
import { CreateExpenseDialog } from "@/components/expense";
import { CreateWalletDialog } from "@/components/wallet";
import { AVAILABLE_WORKSPACE_SHORTCUT, KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { listWorkspacesOptions } from "@/services/query-options";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";

export function ActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = useParams({ strict: false });
	const navigate = useNavigate();
	const { setTheme } = useTheme();
	const { data: workspaces } = useQuery(listWorkspacesOptions());
	const setExpenseOpen = useSetAtom(createExpenseDialogOpenAtom);
	const setWalletOpen = useSetAtom(createWalletDialogOpenAtom);

	useHotkeys(
		AVAILABLE_WORKSPACE_SHORTCUT,
		(data) => {
			if (!workspaces || !workspaces.length) {
				return;
			}
			try {
				const idx = Number.parseInt(data.key) - 1;
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
			description: "Navigate: Workspace",
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
			setTheme((theme) => (theme === "light" ? "dark" : "light"));
		},
		{ description: "Theme: Toggle Light/Dark mode" },
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
		KEYBOARD_SHORTCUTS.goto_dashboard.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug", params: { slug } });
			}
		},
		{ description: "Navigate: Dashboard", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_expenses.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/expenses", params: { slug } });
			}
		},
		{ description: "Navigate: Expenses", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_tasks.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/tasks", params: { slug } });
			}
		},
		{ description: "Navigate: Tasks", enabled: false },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_workspace.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/settings/workspace", params: { slug } });
			}
		},
		{ description: "Navigate: Settings / Workspace", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_members.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/settings/members", params: { slug } });
			}
		},
		{ description: "Navigate: Settings / Members", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_library.hotkey,
		() => {
			if (slug) {
				navigate({ to: "/$slug/settings/library", params: { slug } });
			}
		},
		{ description: "Navigate: Settings / Library", enabled: !!slug },
		[slug, navigate],
	);

	return (
		<CreateExpenseDialog>
			<CreateWalletDialog>{children}</CreateWalletDialog>
		</CreateExpenseDialog>
	);
}
