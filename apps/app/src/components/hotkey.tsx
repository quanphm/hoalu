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
				"pointer-events-none hidden h-5 min-w-6 select-none items-center justify-center gap-1 rounded border bg-background px-1.5 text-center text-muted-foreground text-xs leading-none tracking-wider sm:flex",
				// "ring-primary/50",
				className,
			)}
			{...props}
		>
			{label}
		</span>
	);
}
