import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@hoalu/icons/tabler";

import { cn } from "../utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

type ChangeEventDetails = DialogPrimitive.Root.ChangeEventDetails;

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogViewport(props: React.ComponentProps<typeof DialogPrimitive.Viewport>) {
	return <DialogPrimitive.Viewport data-slot="dialog-viewport" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogBackdrop({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-backdrop"
			className={cn(
				"data-closed:fade-out-0 data-open:fade-in-0 data-closed:animation-duration-[200ms] data-closed:animate-out data-open:animate-in fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
				className,
			)}
			{...props}
		/>
	);
}

function DialogPopup({
	className,
	showCloseButton = true,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & {
	showCloseButton?: boolean;
}) {
	return (
		<DialogPrimitive.Popup
			data-slot="dialog-popup"
			className={cn(
				"data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 bg-background data-closed:animate-out data-open:animate-in fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 data-ending-style:scale-90 data-ending-style:opacity-0 data-nested-dialog-open:after:absolute data-nested-dialog-open:after:inset-0 data-nested-dialog-open:after:rounded-[inherit] data-nested-dialog-open:after:bg-black/20 data-nested-dialog-open:after:backdrop-blur-xs data-starting-style:scale-90 data-starting-style:opacity-0 sm:max-w-lg dark:outline-gray-300",
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close
					data-slot="dialog-close"
					className="ring-offset-background focus:ring-ring data-open:bg-accent data-open:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
				>
					<XIcon />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			)}
		</DialogPrimitive.Popup>
	);
}

function DialogContent(props: React.ComponentProps<typeof DialogPopup>) {
	return (
		<DialogPortal>
			<DialogBackdrop />
			<DialogViewport>
				<DialogPopup {...props} />
			</DialogViewport>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-1 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"sm:bg-muted/50 flex flex-col-reverse gap-2 sm:-mx-6 sm:mt-2 sm:-mb-6 sm:flex-row sm:justify-end sm:rounded-b-lg sm:border-t sm:px-6 sm:py-4",
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
			className={cn("text-xl leading-none font-semibold", className)}
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
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
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
	DialogFooter,
	DialogClose,
};
export type { ChangeEventDetails };
