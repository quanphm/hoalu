import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] [&>svg]:shrink-0 leading-normal",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground",
				secondary: "border-transparent bg-secondary text-secondary-foreground",
				destructive: "border-transparent bg-destructive",
				outline: "text-foreground",
				emerald:
					"bg-emerald-100 text-emerald-800 border-emerald-200 dark:from-emerald-800/45 dark:to-emerald-800/30 dark:text-emerald-200 dark:bg-gradient-to-b dark:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)] dark:bg-transparent dark:border-transparent",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
