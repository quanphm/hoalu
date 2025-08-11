import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { Trash2Icon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { cn } from "@hoalu/ui/utils";
import { createCategoryDialogOpenAtom, selectedCategoryAtom } from "@/atoms";
import { useAppForm } from "@/components/forms";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { createCategoryTheme } from "@/helpers/colors";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useWorkspace } from "@/hooks/use-workspace";
import { CategoryFormSchema, type ColorSchema } from "@/lib/schema";
import { useCreateCategory, useDeleteCategory, useEditCategory } from "@/services/mutations";
import { categoryWithIdQueryOptions } from "@/services/query-options";

export function CreateCategoryDialog({ children }: { children: React.ReactNode }) {
	const [dialog, setOpen] = useAtom(createCategoryDialogOpenAtom);

	return (
		<Dialog open={dialog.isOpen} onOpenChange={setOpen}>
			{children}
			<DialogContent
				className="sm:max-w-[420px]"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>Create new category</DialogTitle>
					<DialogDescription>Create a new category to organize your expenses.</DialogDescription>
				</DialogHeader>
				<DialogDescription />
				<CreateCategoryForm />
			</DialogContent>
		</Dialog>
	);
}

export function CreateCategoryDialogTrigger({
	children,
	showTooltip = true,
}: {
	children: React.ReactNode;
	showTooltip?: boolean;
}) {
	const setOpen = useSetAtom(createCategoryDialogOpenAtom);

	return (
		<HotKeyWithTooltip
			onClick={() => setOpen(true)}
			showTooltip={showTooltip}
			shortcut={KEYBOARD_SHORTCUTS.create_category}
		>
			{children}
		</HotKeyWithTooltip>
	);
}

function CreateCategoryForm() {
	const setOpen = useSetAtom(createCategoryDialogOpenAtom);
	const mutation = useCreateCategory();
	const form = useAppForm({
		defaultValues: {
			name: "✨ Magic",
			description: "",
			color: "red",
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
			setOpen(false);
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => <field.InputWithEmojiPickerField label="Category" autoFocus required />}
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
					<Dialog>
						<DialogTrigger asChild>
							<Button size="icon" variant="ghost">
								<Trash2Icon className="size-4" />
							</Button>
						</DialogTrigger>
						<DeleteCategoryDialogContent />
					</Dialog>
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

function DeleteCategoryDialogContent() {
	const mutation = useDeleteCategory();
	const selectedCategory = useAtomValue(selectedCategoryAtom);
	const onDelete = async () => {
		if (!selectedCategory.id) return;
		await mutation.mutateAsync({ id: selectedCategory.id });
	};

	return (
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete the "{selectedCategory.name}" category?</DialogTitle>
			</DialogHeader>
			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="secondary">
						Cancel
					</Button>
				</DialogClose>
				<Button variant="destructive" onClick={() => onDelete()}>
					Delete
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
