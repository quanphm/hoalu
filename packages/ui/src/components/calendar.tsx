import { ChevronLeftIcon, ChevronRightIcon } from "@hoalu/icons/lucide";
import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../utils";
import { buttonVariants } from "./button";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	components: userComponents,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	const defaultClassNames = {
		root: "bg-card rounded-md",
		months: "relative flex flex-col sm:flex-row gap-4",
		month: "w-full",
		month_grid: "w-full",
		month_caption: "relative mx-10 mb-1 flex h-9 items-center justify-center z-20",
		caption_label: "text-sm font-medium",
		nav: "absolute top-0 flex w-full justify-between z-10",
		nav_button: cn(
			buttonVariants({ variant: "outline" }),
			"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
		),
		button_previous: cn(
			buttonVariants({ variant: "ghost" }),
			"size-9 text-muted-foreground/80 hover:text-foreground p-0",
		),
		button_next: cn(
			buttonVariants({ variant: "ghost" }),
			"size-9 text-muted-foreground/80 hover:text-foreground p-0",
		),
		weekdays: "",
		weekday: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
		day_button: cn(
			buttonVariants({ variant: "ghost" }),
			"relative flex size-9 items-center justify-center whitespace-nowrap rounded-md p-0 text-foreground group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 group-data-disabled:pointer-events-none focus-visible:z-10 hover:not-in-data-selected:bg-accent group-data-selected:bg-primary hover:not-in-data-selected:text-foreground group-data-selected:text-primary-foreground group-data-disabled:text-foreground/30 group-data-disabled:line-through group-data-outside:text-foreground/30 group-data-selected:group-data-outside:text-primary-foreground outline-none focus-visible:ring-ring/20 dark:focus-visible:ring-ring focus-visible:ring-[2px] group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-[.range-middle]:group-data-selected:bg-accent group-[.range-middle]:group-data-selected:text-foreground tabular-nums w-full",
			"h-9 w-9 p-0 font-normal aria-selected:opacity-100",
			"hover:bg-primary hover:text-primary-foreground",
		),
		day: "group size-9 px-0 py-px text-sm",
		range_start: "range-start",
		range_end: "range-end",
		range_middle: "range-middle",
		today:
			"*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
		outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
		hidden: "invisible",
		week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
	};

	const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
		(acc, key) => ({
			// biome-ignore lint/performance/noAccumulatingSpread: originui
			...acc,
			[key]: classNames?.[key as keyof typeof classNames]
				? cn(
						defaultClassNames[key as keyof typeof defaultClassNames],
						classNames[key as keyof typeof classNames],
					)
				: defaultClassNames[key as keyof typeof defaultClassNames],
		}),
		{} as typeof defaultClassNames,
	);

	const defaultComponents = {
		Chevron: (props: {
			className?: string;
			size?: number;
			disabled?: boolean;
			orientation?: "left" | "right" | "up" | "down";
		}) => {
			if (props.orientation === "left") {
				return <ChevronLeftIcon size={16} {...props} aria-hidden="true" />;
			}
			return <ChevronRightIcon size={16} {...props} aria-hidden="true" />;
		},
	};

	const mergedComponents = {
		...defaultComponents,
		...userComponents,
	};

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			weekStartsOn={1}
			className={cn("w-fit", className)}
			classNames={mergedClassNames}
			components={mergedComponents}
			{...props}
		/>
	);
}

export { Calendar };
