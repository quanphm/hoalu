import { cn } from "@hoalu/ui/utils";

import { useLayoutMode } from "#app/hooks/use-layout-mode.ts";

function Section({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
	return <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />;
}

function SectionHeader({ children }: React.ComponentPropsWithRef<"div">) {
	return (
		<div className="flex max-w-full items-center justify-between gap-4">
			<div className="flex max-w-full items-center justify-between gap-4">{children}</div>
		</div>
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
				"grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-(--grid-cols)",
				className,
			)}
			{...props}
		/>
	);
}

function SectionTitle({ className, ref, ...props }: React.ComponentPropsWithRef<"h2">) {
	return <h2 className={cn("font-medium text-lg leading-tight", className)} {...props} />;
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

export { Section, SectionHeader, SectionContent, SectionTitle, SectionItem };
