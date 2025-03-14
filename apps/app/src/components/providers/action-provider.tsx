import { createExpenseDialogOpenAtom, createWalletDialogOpenAtom } from "@/atoms/dialogs";
import { CreateExpenseDialog } from "@/components/expense";
import { CreateWalletDialog } from "@/components/wallet";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";

export function ActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = useParams({ strict: false });
	const navigate = useNavigate();
	const { setTheme } = useTheme();
	const setExpenseOpen = useSetAtom(createExpenseDialogOpenAtom);
	const setWalletOpen = useSetAtom(createWalletDialogOpenAtom);

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
		[slug],
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
			navigate({ to: "/$slug", params: { slug } });
		},
		{ description: "Navigate: Dashboard", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_expenses.hotkey,
		() => {
			navigate({ to: "/$slug/expenses", params: { slug } });
		},
		{ description: "Navigate: Expenses", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_tasks.hotkey,
		() => {
			navigate({ to: "/$slug/tasks", params: { slug } });
		},
		{ description: "Navigate: Tasks", enabled: false },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_workspace.hotkey,
		() => {
			navigate({ to: "/$slug/settings/workspace", params: { slug } });
		},
		{ description: "Navigate: Settings / Workspace", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_members.hotkey,
		() => {
			navigate({ to: "/$slug/settings/members", params: { slug } });
		},
		{ description: "Navigate: Settings / Members", enabled: !!slug },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_library.hotkey,
		() => {
			navigate({ to: "/$slug/settings/library", params: { slug } });
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
