import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils";

const badgeVariants = cva(
	"focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex shrink-0 items-center justify-center gap-1 rounded-sm border border-transparent font-medium whitespace-nowrap transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-3.5 sm:[&_svg:not([class*='size-'])]:size-3 [button,a&]:cursor-pointer [button,a&]:pointer-coarse:after:absolute [button,a&]:pointer-coarse:after:size-full [button,a&]:pointer-coarse:after:min-h-11 [button,a&]:pointer-coarse:after:min-w-11",
	{
		defaultVariants: {
			size: "default",
			variant: "default",
		},
		variants: {
			size: {
				default:
					"h-5.5 min-w-5.5 px-[calc(--spacing(1)-1px)] text-sm sm:h-4.5 sm:min-w-4.5 sm:text-xs",
				lg: "h-6.5 min-w-6.5 px-[calc(--spacing(1.5)-1px)] text-base sm:h-5.5 sm:min-w-5.5 sm:text-sm",
				sm: "h-5 min-w-5 rounded-[calc(var(--radius-sm)-2px)] px-[calc(--spacing(1)-1px)] text-xs sm:h-4 sm:min-w-4 sm:text-[.625rem]",
			},
			variant: {
				default: "bg-primary text-primary-foreground [button,a&]:hover:bg-primary/90",
				secondary: "bg-secondary text-secondary-foreground [button,a&]:hover:bg-secondary/90",
				destructive: "bg-destructive [button,a&]:hover:bg-destructive/90 text-white",
				outline:
					"border-border dark:bg-input/32 [button,a&]:hover:bg-accent/50 dark:[button,a&]:hover:bg-input/48 bg-transparent",
				muted: "text-muted-foreground border-muted [button,a&]:hover:bg-muted/90 bg-transparent",
				info: "text-info border-info/30 bg-info/8 [button,a&]:hover:bg-info/90",
				warning: "text-warning border-warning/30 bg-warning/8 [button,a&]:hover:bg-warning/90",
				error:
					"text-destructive border-destructive/30 bg-destructive/8 [button,a&]:hover:bg-destructive/90",
				success: "text-success border-success/30 bg-success/10 [button,a&]:hover:bg-success/90",
			},
		},
	},
);

interface BadgeProps extends useRender.ComponentProps<"span"> {
	variant?: VariantProps<typeof badgeVariants>["variant"];
	size?: VariantProps<typeof badgeVariants>["size"];
}

function Badge({ className, variant, size, render, ...props }: BadgeProps) {
	const defaultProps = {
		className: cn(badgeVariants({ className, size, variant })),
		"data-slot": "badge",
	};

	return useRender({
		defaultTagName: "span",
		props: mergeProps<"span">(defaultProps, props),
		render,
	});
}

export { Badge, badgeVariants };
