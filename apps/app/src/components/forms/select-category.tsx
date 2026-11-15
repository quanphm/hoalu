import { PlusIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@hoalu/ui/dialog";
import { useLocalStorage } from "@hoalu/ui/hooks";
import { Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { CreateCategoryForm } from "#app/components/categories/category-actions.tsx";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";
import { PillPicker, type PillOption } from "./pill-picker";

const RECENT_CATEGORIES = 6;

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;
	appearance?: "pill" | "field";
	/**
	 * `navigate` sends the user to the category page and back with the new id, which the host form
	 * can only afford when it keeps a draft. Hosts without one keep the in-place dialog.
	 */
	createAction?: "dialog" | "navigate";
	disabled?: boolean;
	type?: "expense" | "income";
}

export function SelectCategoryField(props: Props) {
	const field = useFieldContext<string>();
	const workspace = useWorkspace();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const [dialogOpen, setDialogOpen] = useState(false);
	const type = props.type ?? "expense";
	const [recentIds, setRecentIds] = useLocalStorage<string[]>(
		`recent_${type}_categories_${workspace.slug}`,
		[],
	);

	const allCategories = useLiveQueryCategories();

	const options = useMemo<PillOption[]>(() => {
		const rank = (id: string) => {
			const index = recentIds.indexOf(id);
			return index === -1 ? Number.MAX_SAFE_INTEGER : index;
		};
		return (allCategories ?? [])
			.filter((category) => category.type === type)
			.sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name))
			.map((category) => ({ value: category.id, label: category.name }));
	}, [allCategories, type, recentIds]);

	const handleChange = (id: string) => {
		field.handleChange(id);
		if (!id) return;
		setRecentIds((current) =>
			[id, ...current.filter((entry) => entry !== id)].slice(0, RECENT_CATEGORIES),
		);
	};

	const placeholder =
		props.placeholder ?? (typeof props.label === "string" ? props.label : "Category");

	return (
		<Field className={props.appearance === "field" ? "gap-1" : "w-fit! gap-1 [&>*]:w-auto!"}>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<PillPicker
					options={options}
					value={field.state.value}
					onValueChange={handleChange}
					placeholder={placeholder}
					appearance={props.appearance}
					searchPlaceholder="Search categories…"
					disabled={props.disabled}
					emptyMessage="No category found."
					footer={
						props.createAction === "navigate" ? (
							<Button
								variant="ghost"
								className="w-full justify-start"
								render={
									<Link
										to="/$slug/categories/new"
										params={{ slug }}
										search={{ type, returnTo: "transaction", transactionType: type }}
									/>
								}
							>
								<PlusIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
								New category
							</Button>
						) : (
							<DialogTrigger render={<Button variant="ghost" className="w-full justify-start" />}>
								<PlusIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
								New category
							</DialogTrigger>
						)
					}
				/>
				{props.createAction !== "navigate" && (
					<DialogContent className="sm:max-w-[420px]">
						<DialogHeader>
							<DialogTitle>Create new category</DialogTitle>
						</DialogHeader>
						<CreateCategoryForm type={type} callback={() => setDialogOpen(false)} />
					</DialogContent>
				)}
			</Dialog>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
