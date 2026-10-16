import { cn } from "../utils";

function Frame({
	className,
	stackedPanels = false,
	...props
}: React.ComponentProps<"div"> & { stackedPanels?: boolean }) {
	return (
		<div
			className={cn(
				"bg-muted/60 relative flex flex-col rounded-[calc(var(--radius-xl)+4px)] p-1",
				stackedPanels
					? "*:has-[+[data-slot=frame-panel]]:rounded-b-none *:[[data-slot=frame-panel]+[data-slot=frame-panel]]:rounded-t-none *:[[data-slot=frame-panel]+[data-slot=frame-panel]]:border-t-0"
					: "*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-1",
				className,
			)}
			data-slot="frame"
			{...props}
		/>
	);
}

function FramePanel({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"border-border bg-card shadow-elements relative rounded-xl border p-5",
				className,
			)}
			data-slot="frame-panel"
			{...props}
		/>
	);
}

function FrameHeader({ className, ...props }: React.ComponentProps<"header">) {
	return (
		<header
			data-slot="frame-panel-header"
			className={cn(
				"@container/frame-panel-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 px-3 py-3 has-data-[slot=frame-panel-action]:grid-cols-[1fr_auto] md:gap-1.5 [.border-b]:pb-6",
				className,
			)}
			{...props}
		/>
	);
}

function FrameTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("text-lg font-semibold", className)}
			data-slot="frame-panel-title"
			{...props}
		/>
	);
}

function FrameDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("text-muted-foreground text-sm", className)}
			data-slot="frame-panel-description"
			{...props}
		/>
	);
}

function FrameAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="frame-panel-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 flex gap-2 self-start justify-self-end",
				className,
			)}
			{...props}
		/>
	);
}

function FrameFooter({ className, ...props }: React.ComponentProps<"footer">) {
	return (
		<footer
			className={cn("flex flex-col gap-1 px-5 py-4", className)}
			data-slot="frame-panel-footer"
			{...props}
		/>
	);
}

export { Frame, FramePanel, FrameHeader, FrameTitle, FrameDescription, FrameAction, FrameFooter };
