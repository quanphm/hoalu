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

function SectionContent({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
	return <div ref={ref} className={cn("grid grid-cols-3 gap-6", className)} {...props} />;
}

export { Section, SectionHeader, SectionContent };
