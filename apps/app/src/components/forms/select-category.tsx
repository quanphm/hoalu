import { CreateCategoryForm } from "#app/components/categories/category-actions.tsx";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxSeparator,
} from "@hoalu/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { useState } from "react";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface CategoryOption {
	label: string;
	value: string;
}

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	disabled?: boolean;
}

export function SelectCategoryField(props: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);

	const field = useFieldContext<string>();
	const { value } = field.state;

	const categories = useLiveQueryCategories();
	const categoryOptions: CategoryOption[] = [...categories]
		.sort((a, b) => b.total - a.total)
		.map((c) => ({
			label: c.name,
			value: c.id,
		}));

	const selectedOption = categoryOptions.find((opt) => opt.value === value) ?? null;

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<Combobox<CategoryOption>
					value={selectedOption}
					onValueChange={(newValue) => {
						field.handleChange(newValue?.value ?? "");
					}}
					items={categoryOptions}
					disabled={props.disabled}
				>
					<ComboboxInput placeholder="Select" />
					<ComboboxPopup className="max-h-64">
						<ComboboxEmpty>No result.</ComboboxEmpty>
						<ComboboxList>
							{(item: CategoryOption) => (
								<ComboboxItem
									key={item.value}
									value={item}
									className="grid-cols-[1fr_1rem] ps-3 pe-2 *:first:col-start-2 *:last:col-start-1 *:last:row-start-1"
								>
									{item.label}
								</ComboboxItem>
							)}
						</ComboboxList>
						<ComboboxSeparator />
						<div className="px-1 py-1">
							<DialogTrigger render={<Button variant="ghost" className="w-full justify-start" />}>
								<PlusIcon className="-ms-2 mr-2 size-4 opacity-60" aria-hidden="true" />
								Create new
							</DialogTrigger>
						</div>
					</ComboboxPopup>
				</Combobox>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle>Create new category</DialogTitle>
						<DialogDescription>Create a new category to organize your expenses.</DialogDescription>
					</DialogHeader>
					<CreateCategoryForm
						callback={() => {
							setDialogOpen(false);
						}}
					/>
				</DialogContent>
			</Dialog>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
