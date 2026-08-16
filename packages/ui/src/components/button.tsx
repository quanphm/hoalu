import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils";

const buttonVariants = cva(
	"focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition duration-150 ease-out outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"border-primary bg-primary text-primary-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary/90 data-pressed:bg-primary/90",
				outline:
					"border-input bg-background dark:bg-input/32 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent/50 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-input/64 data-pressed:bg-accent/50 dark:data-pressed:bg-input/64",
				secondary:
					"border-secondary bg-secondary text-secondary-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary/90 data-pressed:bg-secondary/90",
				destructive:
					"border-destructive bg-destructive [@media(hover:hover)_and_(pointer:fine)]:hover:bg-destructive/90 data-pressed:bg-destructive/90 text-white",
				"destructive-outline":
					"border-destructive text-destructive dark:bg-input/32 [@media(hover:hover)_and_(pointer:fine)]:hover:border-destructive/32 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-destructive/4 data-pressed:border-destructive/32 data-pressed:bg-destructive/4 bg-transparent",
				ghost:
					"[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent data-pressed:bg-accent border-transparent",
				link: "border-transparent underline-offset-4 [@media(hover:hover)_and_(pointer:fine)]:hover:underline",
			},
			size: {
				default: "h-9 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)]",
				xs: "min-h-6 gap-1 rounded-md px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1)-1px)] text-xs before:rounded-[calc(var(--radius-md)-1px)] [&_svg:not([class*='size-'])]:size-3",
				sm: "min-h-7 gap-1.5 rounded-md px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)] [&_svg:not([class*='size-'])]:size-3",
				lg: "min-h-9 px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2)-1px)]",
				xl: "min-h-10 px-[calc(--spacing(4)-1px)] py-[calc(--spacing(2)-1px)] text-base [&_svg:not([class*='size-'])]:size-4.5",
				icon: "size-8",
				"icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
				"icon-lg": "size-9",
				date: "h-4 gap-1.5 rounded-sm px-0 text-xs has-[>svg]:px-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

interface ButtonProps extends useRender.ComponentProps<"button"> {
	variant?: VariantProps<typeof buttonVariants>["variant"];
	size?: VariantProps<typeof buttonVariants>["size"];
}
function Button({ className, variant, size, render, ...props }: ButtonProps) {
	const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] = render
		? undefined
		: "button";
	const defaultProps = {
		className: cn(buttonVariants({ className, size, variant })),
		"data-slot": "button",
		type: typeValue,
	};
	return useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(defaultProps, props),
		render,
	});
}

export { Button, type ButtonProps, buttonVariants };
