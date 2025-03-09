import { createExpenseDialogOpenAtom } from "@/atoms/expense-dialog";
import { CreateExpenseDialog } from "@/components/expense";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

const routeApi = getRouteApi("/_dashboard/$slug");

export function ActionProvider({ children }: { children: React.ReactNode }) {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();

	const setExpenseOpen = useSetAtom(createExpenseDialogOpenAtom);

	useHotkeys(
		"mod+e",
		() => {
			setExpenseOpen(true);
		},
		{
			preventDefault: true,
			description: "Dialog: Create new expense",
		},
	);

	useHotkeys(
		"d",
		() => {
			navigate({ to: "/$slug", params: { slug } });
		},
		{
			description: "Navigate: Dashboard",
		},
		[slug, navigate],
	);

	useHotkeys(
		"e",
		() => {
			navigate({ to: "/$slug/expenses", params: { slug } });
		},
		{
			description: "Navigate: Expenses",
		},
		[slug, navigate],
	);

	useHotkeys(
		"t",
		() => {
			navigate({ to: "/$slug/tasks", params: { slug } });
		},
		{
			description: "Navigate: Tasks",
		},
		[slug, navigate],
	);

	useHotkeys(
		"w",
		() => {
			navigate({ to: "/$slug/settings/workspace", params: { slug } });
		},
		{
			description: "Navigate: Settings / Workspace",
		},
		[slug, navigate],
	);

	useHotkeys(
		"m",
		() => {
			navigate({ to: "/$slug/settings/members", params: { slug } });
		},
		{
			description: "Navigate: Settings / Members",
		},
		[slug, navigate],
	);

	useHotkeys(
		"l",
		() => {
			navigate({ to: "/$slug/settings/library", params: { slug } });
		},
		{
			description: "Navigate: Settings / Library",
		},
		[slug, navigate],
	);

	return <CreateExpenseDialog>{children}</CreateExpenseDialog>;
}
