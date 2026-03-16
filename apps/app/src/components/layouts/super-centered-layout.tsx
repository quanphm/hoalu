import { cn } from "@hoalu/ui/utils";

/**
 * The content to be perfectly centered within the parent, regardless of intrinsic size.
 *
 * @see https://web.dev/patterns/layout/super-centered
 */
export function SuperCenteredLayout({
	children,
	className,
	...props
}: React.ComponentPropsWithRef<"div">) {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className={cn("flex w-full max-w-sm flex-col gap-6", className)} {...props}>
				{children}
			</div>
		</div>
	);
}
