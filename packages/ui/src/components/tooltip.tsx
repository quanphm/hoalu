import { Tooltip as TooltipPrimitive } from "@base-ui-components/react/tooltip";

import { cn } from "../utils";

function TooltipProvider(props: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
	return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
	return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

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

function TooltipContent({
	className,
	sideOffset = 4,
	showArrow = false,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Positioner> &
	React.ComponentProps<typeof TooltipPrimitive.Popup> & {
		showArrow?: boolean;
	}) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPositioner sideOffset={sideOffset}>
				<TooltipPrimitive.Popup
					data-slot="tooltip-popup"
					className={cn(
						"fade-in-0 zoom-in-95 data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-[var(--transform-origin)] animate-in text-balance rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs transition-[transform,scale,opacity] data-[closed]:animate-out",
						className,
					)}
					{...props}
				>
					<TooltipArrow />
					{children}
				</TooltipPrimitive.Popup>
			</TooltipPositioner>
		</TooltipPrimitive.Portal>
	);
}

function TooltipArrow({
	className,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Arrow>) {
	return (
		<TooltipPrimitive.Arrow
			data-slot="tooltip-arrow"
			className={cn(
				"z-50 size-2.5 rotate-45 rounded-[2px] bg-primary fill-primary",
				"data-[side=bottom]:-translate-y-1/2 data-[side=bottom]:top-px",
				"data-[side=top]:bottom-px data-[side=top]:translate-y-1/2",
				"data-[side=left]:right-px data-[side=left]:translate-x-1/2",
				"data-[side=right]:-translate-x-1/2 data-[side=right]:left-px",
				className,
			)}
			{...props}
		/>
	);
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow };
