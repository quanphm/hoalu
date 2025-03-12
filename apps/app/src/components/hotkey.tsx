import { cn } from "@hoalu/ui/utils";

export function HotKey({ className, children, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"pointer-events-none hidden h-5 min-w-6 select-none items-center justify-center gap-1 rounded border bg-muted px-1.5 text-center text-muted-foreground text-xs leading-none sm:flex",
				"shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_2px_0_rgba(0,0,0,0.08)]",
				"dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_0_rgba(0,0,0,0.2)]",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
