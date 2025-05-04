import { Slot as SlotPrimitive } from "@hoalu/ui/slot";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";

export function HotKey({
	className,
	label,
	enabled,
	...props
}: React.ComponentProps<"span"> & { label: string | number; enabled: boolean }) {
	if (!enabled) {
		return null;
	}

	return (
		<span
			className={cn(
				"pointer-events-none hidden h-5 min-w-6 select-none items-center justify-center gap-1 rounded border bg-muted px-1.5 text-center text-muted-foreground text-xs leading-none tracking-wider sm:flex",
				"shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_2px_0_rgba(0,0,0,0.08)]",
				"dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_0_rgba(0,0,0,0.2)]",
				"ring-primary/50",
				className,
			)}
			{...props}
		>
			{label}
		</span>
	);
}

export function HotKeyWithTooltip({
	children,
	shortcut,
	showTooltip = true,
	...props
}: SlotPrimitive.SlotProps & {
	shortcut: { label: string; enabled: boolean };
	showTooltip?: boolean;
}) {
	if (!showTooltip || !shortcut.enabled) {
		return <SlotPrimitive.Slot {...props}>{children}</SlotPrimitive.Slot>;
	}

	return (
		<Tooltip>
			<SlotPrimitive.Slot {...props}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
			</SlotPrimitive.Slot>
			<TooltipContent side="bottom">
				<HotKey enabled={showTooltip && shortcut.enabled} label={shortcut.label} />
			</TooltipContent>
		</Tooltip>
	);
}
