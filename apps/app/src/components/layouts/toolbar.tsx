import { cn } from "@hoalu/ui/utils";

function Toolbar({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="toolbar"
			className={cn(
				"bg-card relative flex min-h-7 w-full flex-col items-stretch justify-between gap-3 border-b px-4 py-2.5 md:flex-row md:items-center",
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
			className={cn("flex min-h-7 min-w-0 flex-wrap items-center gap-2", className)}
			{...props}
		/>
	);
}

function ToolbarTitle({ className, children, ...props }: React.ComponentPropsWithRef<"h1">) {
	return (
		<h1
			data-slot="toolbar-title"
			className={cn("text-sm leading-none font-semibold", className)}
			{...props}
		>
			{children}
		</h1>
	);
}

function ToolbarActions({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="toolbar-actions"
			className={cn(
				"flex min-w-0 items-center gap-2 md:justify-end",
				"max-md:w-full max-md:overflow-x-auto max-md:overscroll-x-contain max-md:pb-1",
				"max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden",
				"max-md:[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]",
				className,
			)}
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
