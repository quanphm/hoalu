import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "../utils";
import { buttonVariants } from "./button";

function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
	return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
	return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
	return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
	return (
		<AlertDialogPrimitive.Backdrop
			data-slot="alert-dialog-backdrop"
			className={cn(
				"fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogViewport({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Viewport>) {
	return (
		<AlertDialogPrimitive.Viewport
			data-slot="alert-dialog-viewport"
			className={cn(
				"fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center p-4",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogPopup({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
	return (
		<AlertDialogPortal>
			<AlertDialogOverlay />
			<AlertDialogViewport>
				<AlertDialogPrimitive.Popup
					data-slot="alert-dialog-popup"
					className={cn(
						"bg-background relative z-50 row-start-2 flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border p-6 shadow-lg transition-[scale,opacity] duration-200 ease-out data-ending-style:scale-[0.95] data-ending-style:opacity-0 data-starting-style:scale-[0.95] data-starting-style:opacity-0 sm:max-w-lg dark:outline-gray-300",
						className,
					)}
					{...props}
				/>
			</AlertDialogViewport>
		</AlertDialogPortal>
	);
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-header"
			className={cn(
				"bg-muted/50 @container/alert-dialog-header -mx-6 -mt-6 grid auto-rows-min items-start gap-1 border-b p-4",
				"has-data-[slot=alert-dialog-description]:grid-rows-[auto_auto]",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-footer"
			className={cn(
				"bg-muted/50 -mx-6 -mb-6 flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:rounded-b-lg",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
	return (
		<AlertDialogPrimitive.Title
			data-slot="alert-dialog-title"
			className={cn("font-heading text-md leading-relaxed font-semibold", className)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
	return (
		<AlertDialogPrimitive.Description
			data-slot="alert-dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function AlertDialogAction({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
	return <AlertDialogPrimitive.Close className={cn(buttonVariants(), className)} {...props} />;
}

function AlertDialogCancel({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
	return (
		<AlertDialogPrimitive.Close
			className={cn(buttonVariants({ variant: "outline" }), className)}
			{...props}
		/>
	);
}

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogViewport,
	AlertDialogTrigger,
	AlertDialogPopup,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
};
