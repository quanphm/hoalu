import { cn } from "@hoalu/ui/utils";

function Toolbar({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="toolbar"
			className={cn(
				"relative flex min-h-7 w-full flex-col items-start justify-between gap-3 overflow-scroll px-4 py-2.5 md:flex-row md:items-center md:px-6",
				className,
			)}
			{...props}
		/>
	);
}

function ToolbarGroup({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="toolbar-group"
			className={cn("flex min-h-7 items-center gap-2", className)}
			{...props}
		/>
	);
}

function ToolbarTitle({ className, ...props }: React.ComponentPropsWithRef<"p">) {
	return (
		<p
			data-slot="toolbar-title"
			className={cn("text-sm leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function ToolbarActions({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="toolbar-actions"
			className={cn("flex items-center justify-end gap-2", className)}
			{...props}
		/>
	);
}

function ToolbarSeparator({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div data-slot="toolbar-separator" className={cn("bg-border h-6 w-px", className)} {...props} />
	);
}

export { Toolbar, ToolbarActions, ToolbarGroup, ToolbarSeparator, ToolbarTitle };
