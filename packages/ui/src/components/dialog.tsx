import { XIcon } from "@hoalu/icons/lucide";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import { cn } from "../utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = ({
	className,
	ref,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 grid place-items-center overflow-auto bg-black/70 backdrop-blur-sm",
			className,
		)}
		{...props}
	/>
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = ({
	className,
	children,
	ref,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) => (
	<DialogPortal>
		<DialogOverlay>
			<DialogPrimitive.Content
				ref={ref}
				className={cn(
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-50% data-[state=closed]:slide-out-to-top-48% data-[state=open]:slide-in-from-left-50% data-[state=open]:slide-in-from-top-48% fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg",
					className,
				)}
				{...props}
			>
				{children}
				<DialogPrimitive.Close className="absolute top-4 right-4 cursor-pointer rounded-sm opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<XIcon className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogOverlay>
	</DialogPortal>
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-1.5", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = ({
	className,
	ref,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("font-semibold text-lg leading-none tracking-tight", className)}
		{...props}
	/>
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = ({
	className,
	ref,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("mt-2 text-muted-foreground text-sm", className)}
		{...props}
	/>
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
