import { cn } from "@hoalu/ui/utils";

/**
 * A pill is the closed state of a picker and the marker of a collapsed field. It keeps a hairline
 * at rest so an empty field still reads as something you can open, and a fill is what says "this
 * holds a value" — the one state the page must never make you hunt for.
 */
export const pillClass = {
	base: [
		"relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2 text-sm font-medium whitespace-nowrap select-none",
		"cursor-pointer outline-none transition-[color,background-color,border-color,box-shadow] duration-150 ease-out",
		"focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
		"active:scale-[0.97] motion-reduce:active:scale-100",
		"pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
	].join(" "),
	idle: "border-border text-muted-foreground hover:bg-accent/60 hover:text-foreground",
	active: "border-input bg-accent text-foreground",
};

/** A pill that is its own control: the toggle form of a boolean field. */
export function Chip({
	active,
	className,
	...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
	return (
		<button
			type="button"
			aria-pressed={active}
			className={cn(pillClass.base, active ? pillClass.active : pillClass.idle, className)}
			{...props}
		/>
	);
}
