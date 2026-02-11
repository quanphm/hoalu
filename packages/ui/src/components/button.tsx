import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils";

const buttonVariants = cva(
	"focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition-shadow outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-64 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"border-primary bg-primary text-primary-foreground shadow-primary/24 hover:bg-primary/90 shadow-xs not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] [&:is(:active,[data-pressed])]:inset-shadow-[0_1px_--theme(--color-black/8%)] [&:is(:disabled,:active,[data-pressed])]:shadow-none",
				outline:
					"border-input bg-background dark:bg-input/32 [&:is(:hover,[data-pressed])]:bg-accent/50 dark:[&:is(:hover,[data-pressed])]:bg-input/64",
				secondary:
					"border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90",
				destructive:
					"border-destructive bg-destructive shadow-destructive/24 hover:bg-destructive/90 text-white shadow-xs not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] [&:is(:active,[data-pressed])]:inset-shadow-[0_1px_--theme(--color-black/8%)] [&:is(:disabled,:active,[data-pressed])]:shadow-none",
				"destructive-outline":
					"border-border text-destructive-foreground dark:bg-input/32 [&:is(:hover,[data-pressed])]:border-destructive/32 [&:is(:hover,[data-pressed])]:bg-destructive/4 bg-transparent shadow-xs not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] dark:not-in-data-[slot=group]:bg-clip-border dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/4%)] dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/8%)] [&:is(:disabled,:active,[data-pressed])]:shadow-none",
				ghost: "hover:bg-accent data-pressed:bg-accent border-transparent",
				link: "border-transparent underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)]",
				xs: "min-h-6 gap-1 rounded-md px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1)-1px)] text-xs before:rounded-[calc(var(--radius-md)-1px)] [&_svg:not([class*='size-'])]:size-3",
				sm: "min-h-7 gap-1.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)]",
				lg: "min-h-9 px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2)-1px)]",
				xl: "min-h-10 px-[calc(--spacing(4)-1px)] py-[calc(--spacing(2)-1px)] text-base [&_svg:not([class*='size-'])]:size-4.5",
				icon: "size-8",
				"icon-sm": "size-7",
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

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
	VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, render, ...props }: ButtonProps) {
	return (
		<ButtonPrimitive
			nativeButton
			data-slot="button"
			focusableWhenDisabled
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, type ButtonProps, buttonVariants };
