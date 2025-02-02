import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({
	className,
	sideOffset = 4,
	showArrow,
	children,
	...props
}: React.ComponentPropsWithRef<typeof TooltipPrimitive.Content> & { showArrow?: boolean }) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			sideOffset={sideOffset}
			className={cn(
				"fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-w-[280px] animate-in rounded-lg border border-border bg-popover px-3 py-1.5 text-popover-foreground text-sm data-[state=closed]:animate-out",
				className,
			)}
			{...props}
		>
			{children}
			{showArrow && (
				<TooltipPrimitive.Arrow className="-my-px fill-popover drop-shadow-[0_1px_0_hsl(var(--border))]" />
			)}
		</TooltipPrimitive.Content>
	</TooltipPrimitive.Portal>
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
