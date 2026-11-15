import { CaretDownIcon, CaretUpIcon, MagnifyingGlassIcon, TrashIcon } from "@hoalu/icons/phosphor";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Field as UIField, FieldGroup } from "@hoalu/ui/field";
import { Input } from "@hoalu/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";
import { useNavigate, useParams } from "@tanstack/react-router";

import { categorySearchKeywords$, deleteCategoryDialog } from "#app/atoms/index.ts";
import { type SyncedCategory } from "#app/components/categories/use-categories.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { AVAILABLE_CATEGORY_TYPE_OPTIONS } from "#app/helpers/constants.ts";
import { CategoryFormSchema } from "#app/lib/schema.ts";
import { useCreateCategory, useDeleteCategory } from "#app/services/mutations.ts";

import type { ColorSchema } from "@hoalu/schema/schema";

/** The dialog-shaped quick-add used from inside another form's category picker. */
export function CreateCategoryForm({
	type,
	callback,
}: {
	type?: "expense" | "income";
	callback(): void;
}) {
	const mutation = useCreateCategory();
	const form = useAppForm({
		defaultValues: {
			name: "🔮 Magic",
			description: "",
			color: "purple",
			type: type ?? null,
		} as CategoryFormSchema,
		validators: {
			onSubmit: CategoryFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				payload: {
					name: value.name,
					description: value.description,
					color: value.color,
					type: value.type,
				},
			});

			callback();
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup>
					<form.AppField
						name="name"
						children={(field) => <field.InputWithEmojiPickerField label="Category" required />}
					/>
					<form.AppField
						name="description"
						children={(field) => <field.InputField label="Description" autoComplete="off" />}
					/>
					{!type && (
						<form.AppField
							name="type"
							children={(field) => (
								<field.SelectField label="Type" options={AVAILABLE_CATEGORY_TYPE_OPTIONS} />
							)}
						/>
					)}
					<form.AppField name="color" children={(field) => <field.ColorsField label="Color" />} />
				</FieldGroup>

				<div className="my-2 flex items-center justify-center p-2">
					<form.Subscribe selector={(state) => [state.values.color, state.values.name]}>
						{([color, name]) => (
							<Badge className={cn(createCategoryTheme(color as ColorSchema), "scale-105")}>
								{name || <>&nbsp;</>}
							</Badge>
						)}
					</form.Subscribe>
				</div>

				<DialogFooter>
					<UIField orientation="horizontal" className="justify-end">
						<form.SubscribeButton>Create category</form.SubscribeButton>
					</UIField>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

export function CategorySearch() {
	const value = useValue(categorySearchKeywords$);
	const setValue = categorySearchKeywords$.set;

	return (
		<div className="relative w-full md:w-80">
			<Input
				type="search"
				size="sm"
				aria-label="Search categories"
				placeholder="Search name, description..."
				className="peer ps-6 focus-visible:ring-0"
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
				}}
			/>
			<div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
				<MagnifyingGlassIcon className="text-muted-foreground size-3" aria-hidden="true" />
			</div>
		</div>
	);
}

export function CategoryNavigation(props: {
	onGoUp: () => void;
	onGoDown: () => void;
	canGoUp: boolean;
	canGoDown: boolean;
	category: SyncedCategory;
}) {
	const setDialog = deleteCategoryDialog.set;

	return (
		<>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							size="icon-sm"
							variant="outline"
							onClick={props.onGoDown}
							disabled={!props.canGoDown}
						/>
					}
				>
					<CaretDownIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Down (J)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							size="icon-sm"
							variant="outline"
							onClick={props.onGoUp}
							disabled={!props.canGoUp}
						/>
					}
				>
					<CaretUpIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Up (K)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							size="icon-sm"
							variant="outline"
							aria-label="Delete category"
							onClick={() =>
								setDialog({
									state: true,
									data: { id: props.category.id, name: props.category.name },
								})
							}
						/>
					}
				>
					<TrashIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Delete</TooltipContent>
			</Tooltip>
		</>
	);
}

export function DeleteCategoryDialogContent() {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const mutation = useDeleteCategory();
	const dialog = useValue(deleteCategoryDialog.$);
	const setDialog = deleteCategoryDialog.set;

	const categoryName = dialog?.data?.name ?? "this category";

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		try {
			await mutation.mutateAsync({ id: dialog.data.id });
			navigate({ to: "/$slug/categories", params: { slug } });
		} finally {
			setDialog({ state: false });
		}
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete "{categoryName}"?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				Transactions labeled with this category will be unlabeled. This action cannot be undone.
			</WarningMessage>
			<DialogFooter>
				<DialogClose
					render={<Button type="button" variant="outline" disabled={mutation.isPending} />}
				>
					Cancel
				</DialogClose>
				<Button variant="destructive" onClick={onDelete} disabled={mutation.isPending}>
					Delete
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}
