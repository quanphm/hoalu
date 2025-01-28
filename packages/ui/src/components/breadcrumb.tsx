import { ChevronRight, MoreHorizontal } from "@hoalu/icons/lucide";
import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";
import { cn } from "../utils";

const Breadcrumb = ({
	ref,
	...props
}: React.ComponentPropsWithRef<"nav"> & {
	separator?: React.ReactNode;
}) => <nav ref={ref} aria-label="breadcrumb" {...props} />;
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = ({ className, ref, ...props }: React.ComponentPropsWithRef<"ol">) => (
	<ol
		ref={ref}
		className={cn(
			"flex flex-wrap items-center gap-1.5 break-words text-muted-foreground text-sm sm:gap-2.5",
			className,
		)}
		{...props}
	/>
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = ({ className, ref, ...props }: React.ComponentPropsWithRef<"li">) => (
	<li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = ({
	asChild,
	className,
	ref,
	...props
}: React.ComponentPropsWithRef<"a"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : "a";

	return (
		<Comp
			ref={ref}
			className={cn("transition-colors hover:text-foreground", className)}
			{...props}
		/>
	);
};
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = ({ className, ref, ...props }: React.ComponentPropsWithRef<"span">) => (
	// biome-ignore lint/a11y/useFocusableInteractive: bypass
	<span
		ref={ref}
		role="link"
		aria-disabled="true"
		aria-current="page"
		className={cn("font-medium text-foreground", className)}
		{...props}
	/>
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => (
	<li
		role="presentation"
		aria-hidden="true"
		className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)}
		{...props}
	>
		{children ?? <ChevronRight />}
	</li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
	<span
		role="presentation"
		aria-hidden="true"
		className={cn("flex h-9 w-9 items-center justify-center", className)}
		{...props}
	>
		<MoreHorizontal className="h-4 w-4" />
		<span className="sr-only">More</span>
	</span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};
