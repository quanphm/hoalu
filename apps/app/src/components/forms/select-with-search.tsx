import { useState } from "react";

import { CheckIcon, ChevronDownIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@hoalu/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { cn } from "@hoalu/ui/utils";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	options: { value: string; label: string }[];
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
}

export function SelectWithSearchField(props: Props) {
	const field = useFieldContext<string>();
	const [open, setOpen] = useState(false);
	const { value } = field.state;

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Popover open={open} onOpenChange={setOpen} modal={false}>
				<FieldControl>
					<PopoverTrigger
						render={
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								className={cn(
									"w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
									"focus:border-ring focus:ring-[3px] focus:ring-ring/20",
								)}
							/>
						}
						disabled={props.disabled}
					>
						<span className={cn("truncate", !value && "text-muted-foreground")}>
							{value ? props.options.find((opt) => opt.value === value)?.label : "Select"}
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
							<CommandGroup>
								{props.options.map((opt) => (
									<CommandItem
										key={opt.value}
										value={opt.label}
										onSelect={(currentLabel) => {
											const currentOption = props.options.find((opt) => opt.label === currentLabel);
											if (currentOption) {
												field.handleChange(
													currentOption.value === value ? "" : currentOption.value,
												);
											}
											setOpen(false);
										}}
									>
										{opt.label}
										{value === opt.value && <CheckIcon size={16} className="ml-auto" />}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
