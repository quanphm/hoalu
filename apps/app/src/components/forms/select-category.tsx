import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";

import { CheckIcon, ChevronDownIcon, PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@hoalu/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { Separator } from "@hoalu/ui/separator";
import { cn } from "@hoalu/ui/utils";

import { categoriesQueryOptions } from "#app/services/query-options.ts";
import { CreateCategoryForm } from "../category-actions";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

const routeApi = getRouteApi("/_dashboard/$slug");

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	disabled?: boolean;
}

export function SelectCategoryField(props: Props) {
	const { slug } = routeApi.useParams();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	const field = useFieldContext<string>();
	const { value } = field.state;

	const { data: categories } = useSuspenseQuery({
		...categoriesQueryOptions(slug),
		select: (data) =>
			data.map((c) => ({
				label: c.name,
				value: c.id,
			})),
	});

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={true}>
					<FieldControl>
						<PopoverTrigger
							render={
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={popoverOpen}
									className={cn(
										"w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
										"focus:border-ring focus:ring-[3px] focus:ring-ring/20",
									)}
								/>
							}
							disabled={props.disabled}
						>
							<span className={cn("truncate", !value && "text-muted-foreground")}>
								{value ? categories.find((opt) => opt.value === value)?.label : "Select"}
							</span>
							<ChevronDownIcon
								aria-hidden="true"
								className="size-4 shrink-0 text-muted-foreground/80"
							/>
						</PopoverTrigger>
					</FieldControl>
					<PopoverContent
						className="w-full min-w-[var(--anchor-width)] border-input p-0"
						align="start"
					>
						<Command>
							<CommandInput placeholder="Search..." />
							<CommandList>
								<CommandEmpty>No result.</CommandEmpty>
								<CommandGroup className="max-h-[175px] overflow-auto">
									{categories.map((opt) => (
										<CommandItem
											key={opt.value}
											value={opt.label}
											onSelect={(currentLabel) => {
												const currentOption = categories.find((opt) => opt.label === currentLabel);
												if (currentOption) {
													field.handleChange(
														currentOption.value === value ? "" : currentOption.value,
													);
												}
												setPopoverOpen(false);
											}}
										>
											{opt.label}
											{value === opt.value && <CheckIcon size={16} className="ml-auto" />}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
						<Separator />
						<div className="overflow-hidden px-2 py-1 text-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-sm">
							<DialogTrigger
								render={
									<Button
										variant="ghost"
										className="w-full justify-start"
										onClick={() => setPopoverOpen(false)}
									/>
								}
							>
								<PlusIcon className="-ms-2 mr-2 size-4 opacity-60" aria-hidden="true" />
								Create new
							</DialogTrigger>
						</div>
					</PopoverContent>
				</Popover>
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
