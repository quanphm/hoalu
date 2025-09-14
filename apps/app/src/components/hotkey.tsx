import { cn } from "@hoalu/ui/utils";

export function HotKey({
	className,
	label,
	enabled = true,
	...props
}: React.ComponentProps<"span"> & { label: string | number; enabled?: boolean }) {
	if (!enabled) {
		return null;
	}

	return (
		<span
			className={cn(
				"pointer-events-none hidden h-5 min-w-6 select-none items-center justify-center gap-1 rounded border bg-muted px-1.5 text-center text-muted-foreground text-xs leading-none tracking-wider sm:flex",
				"shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.2),0_1px_2px_0_rgba(0,0,0,0.05)]",
				"dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_0_rgba(0,0,0,0.2)]",
				"ring-primary/50",
				className,
			)}
			{...props}
		>
			{label}
		</span>
	);
}
