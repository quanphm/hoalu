import { createExpenseDialogOpenAtom, createWalletDialogOpenAtom } from "@/atoms/dialogs";
import { CreateExpenseDialog } from "@/components/expense";
import { CreateWalletDialog } from "@/components/wallet";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

const routeApi = getRouteApi("/_dashboard/$slug");

export function ActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();

	const setExpenseOpen = useSetAtom(createExpenseDialogOpenAtom);
	const setWalletOpen = useSetAtom(createWalletDialogOpenAtom);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_expense.hotkey,
		() => {
			setExpenseOpen(true);
		},
		{ preventDefault: true, description: "Dialog: Create new expense" },
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.create_wallet.hotkey,
		() => {
			setWalletOpen(true);
		},
		{ preventDefault: true, description: "Dialog: Create new wallet" },
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
		KEYBOARD_SHORTCUTS.goto_dashboard.hotkey,
		() => {
			navigate({ to: "/$slug", params: { slug } });
		},
		{ description: "Navigate: Dashboard" },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_expenses.hotkey,
		() => {
			navigate({ to: "/$slug/expenses", params: { slug } });
		},
		{ description: "Navigate: Expenses" },
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
		{ description: "Navigate: Settings / Workspace" },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_members.hotkey,
		() => {
			navigate({ to: "/$slug/settings/members", params: { slug } });
		},
		{ description: "Navigate: Settings / Members" },
		[slug, navigate],
	);

	useHotkeys(
		KEYBOARD_SHORTCUTS.goto_library.hotkey,
		() => {
			navigate({ to: "/$slug/settings/library", params: { slug } });
		},
		{ description: "Navigate: Settings / Library" },
		[slug, navigate],
	);

	return (
		<CreateExpenseDialog>
			<CreateWalletDialog>{children}</CreateWalletDialog>
		</CreateExpenseDialog>
	);
}
