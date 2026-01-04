import { Select as SelectPrimitive } from "@base-ui/react/select";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@hoalu/icons/lucide";

import { cn } from "../utils";

function Select<Value, Multiple extends boolean | undefined = false>(
	props: React.ComponentProps<typeof SelectPrimitive.Root<Value, Multiple>>,
) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
	placeholder,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Value> & {
	placeholder?: string;
}) {
	if (!placeholder) {
		return <SelectPrimitive.Value data-slot="select-value" {...props} />;
	}
	return (
		<SelectPrimitive.Value
			data-slot="select-value"
			render={(_, { value }) => {
				if (value) {
					return <SelectPrimitive.Value data-slot="select-value" {...props} />;
				}
				return (
					<span data-slot="select-value" className="text-muted-foreground">
						{placeholder}
					</span>
				);
			}}
			{...props}
		/>
	);
}

function SelectTrigger({
	className,
	size = "default",
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
	size?: "sm" | "default";
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				"flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[size=default]:h-9 data-[size=sm]:h-8 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon render={<ChevronDownIcon className="size-4 opacity-50" />} />
		</SelectPrimitive.Trigger>
	);
}

function SelectPositioner({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Positioner>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				data-slot="select-positioner"
				alignItemWithTrigger={false}
				sideOffset={5}
				className={cn("z-50", className)}
				{...props}
			/>
		</SelectPrimitive.Portal>
	);
}

function SelectContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Popup>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPositioner>
				<SelectScrollUpButton />
				<SelectPrimitive.Popup
					data-slot="select-content"
					className={cn(
						"data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[closed]:animate-out data-[open]:animate-in",
						className,
					)}
					{...props}
				>
					{children}
				</SelectPrimitive.Popup>
				<SelectScrollDownButton />
			</SelectPositioner>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
	return (
		<SelectPrimitive.GroupLabel
			data-slot="select-label"
			className={cn("px-2 py-1.5 text-muted-foreground text-xs", className)}
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				className,
			)}
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
	return (
		<SelectPrimitive.ScrollUpArrow
			data-slot="select-scroll-up-button"
			className={cn("flex cursor-default items-center justify-center py-1", className)}
			{...props}
		>
			<ChevronUpIcon className="size-4" />
		</SelectPrimitive.ScrollUpArrow>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
	return (
		<SelectPrimitive.ScrollDownArrow
			data-slot="select-scroll-down-button"
			className={cn("flex cursor-default items-center justify-center py-1", className)}
			{...props}
		>
			<ChevronDownIcon className="size-4" />
		</SelectPrimitive.ScrollDownArrow>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
