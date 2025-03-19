import { createCategoryDialogOpenAtom } from "@/atoms/dialogs";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { createCategoryTheme } from "@/helpers/colors";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useWorkspace } from "@/hooks/use-workspace";
import { type CategoryFormSchema, categoryFormSchema } from "@/lib/schema";
import { useCreateCategory, useDeleteCategory, useEditCategory } from "@/services/mutations";
import { categoryWithIdQueryOptions } from "@/services/query-options";
import { MoreVerticalIcon } from "@hoalu/icons/lucide";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { cn } from "@hoalu/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAppForm } from "./forms";

function CreateCategoryDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useAtom(createCategoryDialogOpenAtom);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent
				className="sm:max-w-[420px]"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>Create new category</DialogTitle>
					<DialogDescription>
						Create a new custom category to organize your expenses.
					</DialogDescription>
				</DialogHeader>
				<DialogDescription />
				<CreateCategoryForm />
			</DialogContent>
		</Dialog>
	);
}

function CreateCategoryDialogTrigger({
	children,
	showTooltip = true,
}: { children: React.ReactNode; showTooltip?: boolean }) {
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
			onSubmit: categoryFormSchema,
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
					{(field) => <field.InputField label="Category" autoFocus required />}
				</form.AppField>
				<form.AppField name="description">
					{(field) => <field.InputField label="Description" autoComplete="off" />}
				</form.AppField>
				<form.AppField name="color">{(field) => <field.ColorsField label="Color" />}</form.AppField>

				<div className="my-2 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 p-4">
					<form.Subscribe selector={(state) => [state.values.color, state.values.name]}>
						{([color, name]) => (
							<Badge className={cn(createCategoryTheme(color as any), "scale-105")}>{name}</Badge>
						)}
					</form.Subscribe>
				</div>

				<Button type="submit" className="ml-auto w-fit">
					Create category
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

function CategoryDropdownMenuWithModal({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState<"none" | "edit" | "delete">("none");
	const handleOpenChange = (state: boolean) => {
		setOpen(state);
		if (state === false) {
			setContent("none");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreVerticalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild onClick={() => setContent("edit")}>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</DialogTrigger>
					<DialogTrigger asChild onClick={() => setContent("delete")}>
						<DropdownMenuItem>
							<span className="text-destructive">Delete</span>
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
			{content === "edit" && (
				<EditCategoryDialogContent id={id} onEditCallback={() => handleOpenChange(false)} />
			)}
			{content === "delete" && (
				<DeleteCategoryDialogContent id={id} onDeleteCallback={() => handleOpenChange(false)} />
			)}
		</Dialog>
	);
}

function EditCategoryForm(props: { id: string; onEditCallback?(): void }) {
	const workspace = useWorkspace();
	const { data: category, status } = useQuery(categoryWithIdQueryOptions(workspace.slug, props.id));

	const mutation = useEditCategory();
	const form = useAppForm({
		defaultValues: {
			name: category?.name ?? "",
			description: category?.description ?? "",
			color: category?.color ?? "gray",
		} as CategoryFormSchema,
		validators: {
			onSubmit: categoryFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: props.id,
				payload: {
					name: value.name,
					description: value.description,
					color: value.color,
				},
			});
			if (props.onEditCallback) props.onEditCallback();
		},
	});

	useEffect(() => {
		if (status === "success") {
			form.reset();
		}
	}, [status, form.reset]);

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => <field.InputField label="Category" autoFocus required />}
				</form.AppField>
				<form.AppField name="description">
					{(field) => <field.InputField label="Description" autoComplete="off" />}
				</form.AppField>
				<form.AppField name="color">{(field) => <field.ColorsField label="Color" />}</form.AppField>

				<div className="my-2 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 p-4">
					<form.Subscribe selector={(state) => [state.values.color, state.values.name]}>
						{([color, name]) => (
							<Badge className={cn(createCategoryTheme(color as any), "scale-105")}>{name}</Badge>
						)}
					</form.Subscribe>
				</div>

				<Button type="submit" className="ml-auto w-fit">
					Update
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

function EditCategoryDialogContent(props: { id: string; onEditCallback?(): void }) {
	return (
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Edit category</DialogTitle>
				<DialogDescription>Update your category details.</DialogDescription>
			</DialogHeader>
			<EditCategoryForm id={props.id} onEditCallback={props.onEditCallback} />
		</DialogContent>
	);
}

function DeleteCategoryDialogContent(props: { id: string; onDeleteCallback?(): void }) {
	const mutation = useDeleteCategory();
	const onDelete = async () => {
		await mutation.mutateAsync({ id: props.id });
		if (props.onDeleteCallback) props.onDeleteCallback();
	};

	return (
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete category?</DialogTitle>
				<DialogDescription />
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

export { CreateCategoryDialog, CreateCategoryDialogTrigger, CategoryDropdownMenuWithModal };
