import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "../utils";

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverBackdrop(props: React.ComponentProps<typeof PopoverPrimitive.Backdrop>) {
	return <PopoverPrimitive.Backdrop data-slot="popover-backdrop" {...props} />;
}

function PopoverPositioner({
	className,
	sideOffset = 4,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Positioner>) {
	return (
		<PopoverPrimitive.Positioner
			data-slot="popover-positioner"
			className={cn("z-50", className)}
			sideOffset={sideOffset}
			{...props}
		/>
	);
}

function PopoverContent({
	className,
	align = "center",
	side = "bottom",
	sideOffset = 4,
	alignOffset = 0,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> &
	React.ComponentProps<typeof PopoverPrimitive.Positioner>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPositioner
				sideOffset={sideOffset}
				alignOffset={alignOffset}
				align={align}
				side={side}
			>
				<PopoverPrimitive.Popup
					data-slot="popover-popup"
					className={cn(
						"data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-popover text-popover-foreground data-closed:animate-out data-open:animate-in w-72 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden transition-[transform,scale,opacity]",
						className,
					)}
					{...props}
				/>
			</PopoverPositioner>
		</PopoverPrimitive.Portal>
	);
}

function PopoverArrow(props: React.ComponentProps<typeof PopoverPrimitive.Arrow>) {
	return (
		<PopoverPrimitive.Arrow
			data-slot="popover-arrow"
			className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180"
			{...props}
		>
			<ArrowSvg />
		</PopoverPrimitive.Arrow>
	);
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
	return (
		<svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
			<path
				d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
				className="fill-[canvas]"
			/>
			<path
				d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
				className="fill-gray-200 dark:fill-none"
			/>
			<path
				d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
				className="dark:fill-gray-300"
			/>
		</svg>
	);
}

function PopoverTitle(props: React.ComponentProps<typeof PopoverPrimitive.Title>) {
	return <PopoverPrimitive.Title data-slot="popover-title" {...props} />;
}

function PopoverDescription(props: React.ComponentProps<typeof PopoverPrimitive.Description>) {
	return <PopoverPrimitive.Description data-slot="popover-description" {...props} />;
}

function PopoverClose(props: React.ComponentProps<typeof PopoverPrimitive.Close>) {
	return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export {
	Popover,
	PopoverTrigger,
	PopoverBackdrop,
	PopoverPositioner,
	PopoverContent,
	PopoverArrow,
	PopoverTitle,
	PopoverDescription,
	PopoverClose,
};
