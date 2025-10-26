import { Tooltip as TooltipPrimitive } from "@base-ui-components/react/tooltip";

import { cn } from "../utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
	return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipPositioner({
	className,
	sideOffset = 4,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Positioner>) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Positioner
				data-slot="tooltip-positioner"
				sideOffset={sideOffset}
				className={cn("z-50", className)}
				{...props}
			/>
		</TooltipPrimitive.Portal>
	);
}

function TooltipPopup({
	className,
	sideOffset = 4,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Positioner> &
	React.ComponentProps<typeof TooltipPrimitive.Popup>) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPositioner sideOffset={sideOffset}>
				<TooltipPrimitive.Popup
					data-slot="tooltip-popup"
					className={cn(
						"relative flex w-fit origin-(--transform-origin) text-balance rounded-md border bg-popover bg-clip-padding px-2 py-1 text-popover-foreground text-xs transition-[scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-md)-1px)] before:shadow-[0_1px_2px_1px_--theme(--color-black/4%)] data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 data-instant:duration-0 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]",
						className,
					)}
					{...props}
				>
					{children}
				</TooltipPrimitive.Popup>
			</TooltipPositioner>
		</TooltipPrimitive.Portal>
	);
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipPopup, TooltipPopup as TooltipContent };
