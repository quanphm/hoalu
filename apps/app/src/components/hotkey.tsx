import { cn } from "@hoalu/ui/utils";

export function HotKey({
	className,
	label,
	enabled = true,
	...props
}: React.ComponentProps<"span"> & { label: React.ReactNode; enabled?: boolean }) {
	if (!enabled) {
		return null;
	}

	return (
		<span
			className={cn(
				"bg-background text-muted-foreground pointer-events-none hidden h-5 min-w-6 items-center justify-center gap-1 rounded border px-1.5 text-center text-[9px] leading-none tracking-widest select-none sm:flex",
				"ring-primary",
				className,
			)}
			{...props}
		>
			{label}
		</span>
	);
}
