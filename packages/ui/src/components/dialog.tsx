import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@hoalu/icons/tabler";

import { cn, mergeProps, useRender } from "../utils";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";

const DialogCreateHandle: typeof DialogPrimitive.createHandle = DialogPrimitive.createHandle;

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

type ChangeEventDetails = DialogPrimitive.Root.ChangeEventDetails;

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogViewport({ className, ...props }: DialogPrimitive.Viewport.Props) {
	return (
		<DialogPrimitive.Viewport
			className={cn(
				"fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center p-4",
				className,
			)}
			data-slot="dialog-viewport"
			{...props}
		/>
	);
}

function DialogClose(props: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close aria-label="Close" data-slot="dialog-close" {...props} />;
}

function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			className={cn(
				"fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			data-slot="dialog-backdrop"
			{...props}
		/>
	);
}

function DialogPopup({
	className,
	showCloseButton = false,
	children,
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean;
}) {
	return (
		<DialogPrimitive.Popup
			data-slot="dialog-popup"
			className={cn(
				"data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 bg-background data-closed:animate-out data-open:animate-in relative z-50 row-start-2 flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border p-6 shadow-lg duration-200 data-ending-style:scale-90 data-ending-style:opacity-0 data-nested-dialog-open:after:absolute data-nested-dialog-open:after:inset-0 data-nested-dialog-open:after:rounded-[inherit] data-starting-style:scale-90 data-starting-style:opacity-0 sm:max-w-lg dark:outline-gray-300",
				"data-nested-dialog-open:after:bg-black/20 data-nested-dialog-open:after:backdrop-blur-xs sm:scale-[calc(1-0.1*var(--nested-dialogs))]",
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogClose
					className="inset-e-4 absolute top-2"
					render={<Button size="icon" variant="outline" />}
				>
					<XIcon />
					<span className="sr-only">Close</span>
				</DialogClose>
			)}
		</DialogPrimitive.Popup>
	);
}

function DialogContent({
	bottomStickOnMobile = true,
	...props
}: DialogPrimitive.Popup.Props & { bottomStickOnMobile?: boolean }) {
	return (
		<DialogPortal>
			<DialogBackdrop />
			<DialogViewport
				className={cn(bottomStickOnMobile && "max-sm:grid-rows-[1fr_auto] max-sm:p-0 max-sm:pt-12")}
			>
				<DialogPopup {...props} />
			</DialogViewport>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn(
				"bg-muted/50 @container/dialog-header -mx-6 -mt-6 grid auto-rows-min items-start gap-1 border-b p-4 " +
					"not-has-data-[slot=dialog-description]:gap-0 " +
					"not-has-data-[slot=dialog-description]:grid-cols-[1fr_auto] " +
					"not-has-data-[slot=dialog-description]:grid-rows-1 " +
					"has-data-[slot=dialog-description]:grid-rows-[auto_auto] " +
					"has-data-[slot=dialog-description]:grid-cols-1 " +
					"has-data-[slot=dialog-header-action]:grid-cols-[1fr_auto] " +
					"in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pb-3 " +
					"max-sm:pb-4",
				className,
			)}
			{...props}
		/>
	);
}

function DialogHeaderAction({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
	return (
		<div
			data-slot="dialog-header-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-center justify-self-end",
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogClose render={<Button size="icon" variant="outline" />}>
					<XIcon />
					<span className="sr-only">Close</span>
				</DialogClose>
			)}
		</div>
	);
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"bg-muted/50 -mx-6 -mb-6 flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:rounded-b-lg",
				className,
			)}
			{...props}
		/>
	);
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn("font-heading text-md self-center leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn("text-muted-foreground/80 text-sm", className)}
			{...props}
		/>
	);
}

function DialogPanel({
	className,
	scrollFade = true,
	render,
	...props
}: useRender.ComponentProps<"div"> & {
	scrollFade?: boolean;
}): React.ReactElement {
	const defaultProps = {
		className: cn(
			"p-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-footer]:not(.border-t))]:pb-1 in-[[data-slot=dialog-popup]:has([data-slot=dialog-header])]:pt-1",
			className,
		),
		"data-slot": "dialog-panel",
	};

	return (
		<ScrollArea scrollFade={scrollFade}>
			{useRender({
				defaultTagName: "div",
				props: mergeProps<"div">(defaultProps, props),
				render,
			})}
		</ScrollArea>
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogPortal,
	DialogViewport,
	DialogBackdrop,
	DialogContent,
	DialogPopup,
	DialogTitle,
	DialogDescription,
	DialogHeader,
	DialogHeaderAction,
	DialogFooter,
	DialogClose,
	DialogPanel,
	DialogCreateHandle,
};
export type { ChangeEventDetails };
