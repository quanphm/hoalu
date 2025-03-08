import { createExpenseDialogOpenAtom } from "@/atoms/expense-dialog";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { CreateExpenseDialog } from "../expense";

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
			description: "open expense dialog",
		},
	);

	useHotkeys(
		"d",
		() => {
			navigate({ to: "/$slug", params: { slug } });
		},
		{
			description: "Go to Dashboard",
		},
		[slug, navigate],
	);

	useHotkeys(
		"e",
		() => {
			navigate({ to: "/$slug/expenses", params: { slug } });
		},
		{
			description: "Go to Expenses",
		},
		[slug, navigate],
	);

	useHotkeys(
		"t",
		() => {
			navigate({ to: "/$slug/tasks", params: { slug } });
		},
		{
			description: "Go to Tasks",
		},
		[slug, navigate],
	);

	useHotkeys(
		"w",
		() => {
			navigate({ to: "/$slug/settings/workspace", params: { slug } });
		},
		{
			description: "Go to Settings / Workspace",
		},
		[slug, navigate],
	);

	useHotkeys(
		"m",
		() => {
			navigate({ to: "/$slug/settings/members", params: { slug } });
		},
		{
			description: "Go to Settings / Members",
		},
		[slug, navigate],
	);

	useHotkeys(
		"l",
		() => {
			navigate({ to: "/$slug/settings/library", params: { slug } });
		},
		{
			description: "Go to Settings / Library",
		},
		[slug, navigate],
	);

	return <CreateExpenseDialog>{children}</CreateExpenseDialog>;
}
