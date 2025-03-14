import { HotKeyWithTooltip } from "@/components/hotkey";
import { createCategoryTheme } from "@/helpers/colors";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { type CategoryFormSchema, categoryFormSchema } from "@/lib/schema";
import { useCreateCategory } from "@/services/mutations";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { cn } from "@hoalu/ui/utils";
import { createContext, use, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useAppForm } from "./forms";

type CreateContext = {
	open: boolean;
	setOpen: (open: boolean) => void;
};
const CreateContext = createContext<CreateContext | null>(null);

function CreateCategoryDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const contextValue = useMemo<CreateContext>(() => ({ open, setOpen }), [open]);

	useHotkeys(KEYBOARD_SHORTCUTS.create_category.hotkey, () => setOpen(true), {
		preventDefault: true,
		description: "Dialog: Create new category",
	});

	return (
		<CreateContext value={contextValue}>
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
		</CreateContext>
	);
}

function CreateCategoryDialogTrigger({ children }: { children: React.ReactNode }) {
	return (
		<DialogTrigger asChild>
			<HotKeyWithTooltip shortcut={KEYBOARD_SHORTCUTS.create_category.label}>
				{children}
			</HotKeyWithTooltip>
		</DialogTrigger>
	);
}

function CreateCategoryForm() {
	const context = use(CreateContext);
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
			const payload = {
				name: value.name,
				description: value.description,
				color: value.color,
			};
			await mutation.mutateAsync({ payload });
			context?.setOpen(false);
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

export { CreateCategoryDialog, CreateCategoryDialogTrigger };
