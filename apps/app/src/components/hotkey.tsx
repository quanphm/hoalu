import { cn } from "@hoalu/ui/utils";

export function HotKey({ className, children, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"pointer-events-none hidden h-5 min-w-6 select-none items-center justify-center gap-1 rounded border bg-muted px-1.5 text-center text-muted-foreground text-xs leading-none sm:flex",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
