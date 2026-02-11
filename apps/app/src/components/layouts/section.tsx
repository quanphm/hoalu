import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { cn } from "@hoalu/ui/utils";

function Section({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			ref={ref}
			data-slot="section"
			className={cn("flex flex-col gap-4", className)}
			{...props}
		/>
	);
}

function SectionHeader({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="section-header"
			className={cn(
				"@container/section-header grid auto-rows-min grid-rows-[auto_auto] gap-1 has-data-[slot=section-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
				className,
			)}
			{...props}
		/>
	);
}

function SectionAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="section-action"
			className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
			{...props}
		/>
	);
}

function SectionContent({
	className,
	ref,
	columns = 1,
	mobileLayout = "stack",
	...props
}: React.ComponentPropsWithRef<"div"> & {
	columns?: number;
	mobileLayout?: "stack" | "tabs" | "drawer";
}) {
	const { mode } = useLayoutMode();

	if (mode === "mobile") {
		return (
			<div
				ref={ref}
				className={cn("flex h-full flex-col gap-4 overflow-hidden", className)}
				{...props}
			/>
		);
	}

	if (mode === "tablet") {
		return (
			<div
				ref={ref}
				className={cn("grid h-full grid-cols-2 gap-4 overflow-hidden", className)}
				{...props}
			/>
		);
	}

	// Desktop: Original grid layout
	return (
		<div
			ref={ref}
			style={
				{
					"--grid-cols": `repeat(${columns}, minmax(0, 1fr))`,
				} as React.CSSProperties
			}
			className={cn(
				"grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-(--grid-cols)",
				className,
			)}
			{...props}
		/>
	);
}

function SectionTitle({ className, ref, children, ...props }: React.ComponentPropsWithRef<"h2">) {
	return (
		<h2
			data-slot="section-title"
			className={cn("text-xl leading-tight font-medium", className)}
			{...props}
		>
			{children}
		</h2>
	);
}

function SectionDescription({ className, ref, ...props }: React.ComponentPropsWithRef<"p">) {
	return (
		<p
			data-slot="section-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function SectionItem({
	children,
	className,
	mobileOrder = 0,
	tabletSpan = 1,
	desktopSpan,
	hideOnMobile = false,
	...props
}: React.ComponentPropsWithRef<"div"> & {
	mobileOrder?: number;
	tabletSpan?: number;
	desktopSpan?: string;
	hideOnMobile?: boolean;
}) {
	const { shouldUseMobileLayout, shouldUseTabletLayout } = useLayoutMode();

	if (hideOnMobile && shouldUseMobileLayout) {
		return null;
	}

	if (shouldUseMobileLayout) {
		return (
			<div
				className={cn("flex-1 overflow-auto", className)}
				style={{ order: mobileOrder }}
				{...props}
			>
				{children}
			</div>
		);
	}

	if (shouldUseTabletLayout) {
		return (
			<div className={cn(`col-span-${tabletSpan} overflow-auto`, className)} {...props}>
				{children}
			</div>
		);
	}

	return (
		<div className={cn(desktopSpan || "col-span-1", "overflow-auto", className)} {...props}>
			{children}
		</div>
	);
}

export {
	Section,
	SectionHeader,
	SectionContent,
	SectionTitle,
	SectionDescription,
	SectionAction,
	SectionItem,
};
