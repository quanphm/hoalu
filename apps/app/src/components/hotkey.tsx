import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";
import { Slot, type SlotProps } from "@radix-ui/react-slot";

export function HotKey({ className, children, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"pointer-events-none hidden h-5 min-w-6 select-none items-center justify-center gap-1 rounded border bg-muted px-1.5 text-center text-muted-foreground text-xs leading-none sm:flex",
				"shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_2px_0_rgba(0,0,0,0.08)]",
				"dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_0_rgba(0,0,0,0.2)]",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}

export function HotKeyWithTooltip({
	children,
	shortcut,
	...props
}: SlotProps & { shortcut: string }) {
	return (
		<Tooltip>
			<Slot {...props}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
			</Slot>
			<TooltipContent side="bottom">
				<HotKey>{shortcut}</HotKey>
			</TooltipContent>
		</Tooltip>
	);
}
