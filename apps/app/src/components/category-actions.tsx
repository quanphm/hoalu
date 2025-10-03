import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { Trash2Icon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { cn } from "@hoalu/ui/utils";
import { createCategoryDialogAtom, deleteCategoryDialogAtom, selectedCategoryAtom } from "@/atoms";
import { useAppForm } from "@/components/forms";
import { HotKey } from "@/components/hotkey";
import { createCategoryTheme } from "@/helpers/colors";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useWorkspace } from "@/hooks/use-workspace";
import { CategoryFormSchema, type ColorSchema } from "@/lib/schema";
import { useCreateCategory, useDeleteCategory, useEditCategory } from "@/services/mutations";
import { categoryWithIdQueryOptions } from "@/services/query-options";

export function CreateCategoryDialogTrigger() {
	const setDialog = useSetAtom(createCategoryDialogAtom);

	return (
		<Button variant="outline" onClick={() => setDialog({ state: true })}>
			Create category
			<HotKey {...KEYBOARD_SHORTCUTS.create_category} />
		</Button>
	);
}

export function CreateCategoryDialogContent() {
	return (
		<DialogPopup className="sm:max-w-[420px]">
			<DialogHeader>
				<DialogTitle>Create new category</DialogTitle>
				<DialogDescription>Create a new category to organize your expenses.</DialogDescription>
			</DialogHeader>
			<CreateCategoryForm />
		</DialogPopup>
	);
}

export function CreateCategoryForm({ callback }: { callback?(): void }) {
	const setDialog = useSetAtom(createCategoryDialogAtom);
	const mutation = useCreateCategory();
	const form = useAppForm({
		defaultValues: {
			name: "🔮 Magic",
			description: "",
			color: "purple",
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
				},
			});

			if (callback) {
				console.log("test");
				callback();
			} else {
				setDialog({ state: false });
			}
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => <field.InputWithEmojiPickerField label="Category" required />}
				</form.AppField>
				<form.AppField name="description">
					{(field) => <field.InputField label="Description" autoComplete="off" />}
				</form.AppField>
				<form.AppField name="color">{(field) => <field.ColorsField label="Color" />}</form.AppField>

				<div className="my-2 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 p-4">
					<form.Subscribe selector={(state) => [state.values.color, state.values.name]}>
						{([color, name]) => (
							<Badge className={cn(createCategoryTheme(color as ColorSchema), "scale-105")}>
								{name || <>&nbsp;</>}
							</Badge>
						)}
					</form.Subscribe>
				</div>
				<form.SubscribeButton useSound className="ml-auto w-fit">
					Create category
				</form.SubscribeButton>
			</form.Form>
		</form.AppForm>
	);
}

export function EditCategoryForm(props: { onEditCallback?(): void }) {
	const workspace = useWorkspace();
	const selectedCategory = useAtomValue(selectedCategoryAtom);
	const { data: category } = useSuspenseQuery(
		categoryWithIdQueryOptions(workspace.slug, selectedCategory.id || ""),
	);

	const editMutation = useEditCategory();
	const form = useAppForm({
		defaultValues: {
			name: category?.name ?? "",
			description: category?.description ?? "",
			color: category?.color ?? "gray",
		} as CategoryFormSchema,
		validators: {
			onSubmit: CategoryFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!selectedCategory.id) {
				return;
			}

			await editMutation.mutateAsync({
				id: selectedCategory.id,
				payload: {
					name: value.name,
					description: value.description,
					color: value.color,
				},
			});
			if (props.onEditCallback) props.onEditCallback();
		},
	});

	const setDialog = useSetAtom(deleteCategoryDialogAtom);

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => <field.InputWithEmojiPickerField label="Category" required />}
				</form.AppField>
				<form.AppField name="description">
					{(field) => <field.InputField label="Description" autoComplete="off" />}
				</form.AppField>
				<form.AppField name="color">{(field) => <field.ColorsField label="Color" />}</form.AppField>

				<div className="my-2 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 p-4">
					<form.Subscribe selector={(state) => [state.values.color, state.values.name]}>
						{([color, name]) => (
							<Badge className={cn(createCategoryTheme(color as ColorSchema), "scale-105")}>
								{name || <>&nbsp;</>}
							</Badge>
						)}
					</form.Subscribe>
				</div>

				<div className="flex w-full items-center justify-between">
					<Button
						type="button"
						size="icon"
						variant="ghost"
						onClick={() => setDialog({ state: true })}
					>
						<Trash2Icon className="size-4" />
					</Button>
					<div>
						<Button type="reset" variant="ghost" className="mr-2" onClick={() => form.reset()}>
							Reset
						</Button>
						<form.SubscribeButton useSound>Update</form.SubscribeButton>
					</div>
				</div>
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteCategoryDialogContent() {
	const mutation = useDeleteCategory();
	const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom);
	const setDialog = useSetAtom(deleteCategoryDialogAtom);
	const onDelete = async () => {
		if (!selectedCategory.id) {
			setDialog({ state: false, data: undefined });
			return;
		}
		await mutation.mutateAsync({ id: selectedCategory.id });
		setDialog({ state: false, data: undefined });
		setSelectedCategory({ id: null, name: null });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete the "{selectedCategory.name}" category?</DialogTitle>
			</DialogHeader>
			<DialogFooter>
				<Button type="button" variant="secondary" onClick={() => setDialog({ state: false })}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onDelete}>
					Delete
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}
