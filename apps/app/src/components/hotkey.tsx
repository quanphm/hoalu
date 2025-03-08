import { cn } from "@hoalu/ui/utils";

export function HotKey({ className, children, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"pointer-events-none hidden h-5 min-w-6 select-none items-center justify-center rounded border bg-muted px-1.5 text-center text-[10px] text-muted-foreground leading-none sm:flex",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
