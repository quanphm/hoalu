import { cn } from "@hoalu/ui/utils";

function Section({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
	return <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />;
}

function SectionHeader({ children }: React.ComponentPropsWithRef<"div">) {
	return (
		<div className="flex max-w-full items-center justify-between gap-4">
			<div className="flex max-w-full items-center justify-between gap-4">{children}</div>
			<div className="relative flex-1 after:absolute after:h-0.25 after:w-full after:bg-muted-foreground/10 after:content-['']" />
		</div>
	);
}

function SectionContent({
	className,
	ref,
	columns = 1,
	...props
}: React.ComponentPropsWithRef<"div"> & {
	columns?: number;
}) {
	return (
		<div
			ref={ref}
			style={
				{
					"--grid-cols": `repeat(${columns}, minmax(0, 1fr))`,
				} as React.CSSProperties
			}
			className={cn(
				"grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-(--grid-cols)",
				className,
			)}
			{...props}
		/>
	);
}

function SectionTitle({ className, ref, ...props }: React.ComponentPropsWithRef<"p">) {
	return <h2 className={cn("font-medium text-lg leading-8", className)} {...props} />;
}

export { Section, SectionHeader, SectionContent, SectionTitle };
