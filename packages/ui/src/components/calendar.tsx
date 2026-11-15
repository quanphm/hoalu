import { CaretDownIcon, CaretLeftIcon, CaretRightIcon } from "@hoalu/icons/phosphor";
import * as React from "react";
import { type DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "../utils/cn";
import { Button, buttonVariants } from "./button";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	buttonVariant = "ghost",
	formatters,
	components,
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
	const defaultClassNames = getDefaultClassNames();

	return (
		<DayPicker
			weekStartsOn={1}
			showOutsideDays={showOutsideDays}
			className={cn(
				"group/calendar p-2 [--cell-size:--spacing(8)]",
				String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
				String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
				className,
			)}
			captionLayout={captionLayout}
			formatters={{
				formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
				...formatters,
			}}
			classNames={{
				root: cn("w-fit", defaultClassNames.root),
				months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
				month: cn("flex w-full flex-col gap-2", defaultClassNames.month),
				nav: cn(
					"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
					defaultClassNames.nav,
				),
				button_previous: cn(
					buttonVariants({ variant: buttonVariant }),
					"size-7 rounded-md p-0 select-none aria-disabled:opacity-50",
					defaultClassNames.button_previous,
				),
				button_next: cn(
					buttonVariants({ variant: buttonVariant }),
					"size-7 rounded-md p-0 select-none aria-disabled:opacity-50",
					defaultClassNames.button_next,
				),
				month_caption: cn(
					"flex h-8 w-full items-center justify-center px-8",
					defaultClassNames.month_caption,
				),
				dropdowns: cn(
					"flex w-full items-center justify-center gap-1.5 text-sm font-medium",
					defaultClassNames.dropdowns,
				),
				dropdown_root: cn(
					"border-input bg-accent text-foreground has-focus:ring-ring/40 relative inline-flex rounded-md border transition-[color,background-color,border-color,box-shadow] duration-150 ease-out has-focus:ring-2",
					defaultClassNames.dropdown_root,
				),
				dropdown: cn("absolute inset-0 cursor-pointer opacity-0", defaultClassNames.dropdown),
				caption_label: cn(
					"flex h-7 items-center gap-1 rounded-md ps-2 pe-1.5 text-sm font-medium tabular-nums select-none [&>svg]:size-3.5 [&>svg]:opacity-60",
					defaultClassNames.caption_label,
				),
				month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
				weekdays: cn("flex", defaultClassNames.weekdays),
				weekday: cn(
					"text-muted-foreground flex-1 pb-1 text-xs font-medium select-none",
					defaultClassNames.weekday,
				),
				week: cn("flex w-full", defaultClassNames.week),
				week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
				week_number: cn(
					"text-muted-foreground text-xs tabular-nums select-none",
					defaultClassNames.week_number,
				),
				day: cn(
					"group/day relative aspect-square h-full w-full p-0 text-center select-none",
					defaultClassNames.day,
				),
				range_start: cn("rounded-l-md", defaultClassNames.range_start),
				range_middle: cn("bg-foreground/12 rounded-none", defaultClassNames.range_middle),
				range_end: cn("rounded-r-md", defaultClassNames.range_end),
				today: cn("text-foreground", defaultClassNames.today),
				outside: cn(
					"text-muted-foreground aria-selected:text-muted-foreground",
					defaultClassNames.outside,
				),
				disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
				hidden: cn("invisible", defaultClassNames.hidden),
				...classNames,
			}}
			components={{
				Root: ({ className, rootRef, ...props }) => {
					return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
				},
				Chevron: ({ className, orientation, ...props }) => {
					if (orientation === "left") {
						return <CaretLeftIcon className={cn("size-4", className)} {...props} />;
					}

					if (orientation === "right") {
						return <CaretRightIcon className={cn("size-4", className)} {...props} />;
					}

					return <CaretDownIcon className={cn("size-4", className)} {...props} />;
				},
				DayButton: CalendarDayButton,
				WeekNumber: ({ children, ...props }) => {
					return (
						<td {...props}>
							<div className="flex size-(--cell-size) items-center justify-center text-center">
								{children}
							</div>
						</td>
					);
				},
				...components,
			}}
			{...props}
		/>
	);
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	children,
	...props
}: React.ComponentProps<typeof DayButton>) {
	const defaultClassNames = getDefaultClassNames();

	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			data-day={day.date.toLocaleDateString()}
			data-today={modifiers.today || undefined}
			data-outside={modifiers.outside || undefined}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				"relative flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal tabular-nums",
				"data-[selected-single=true]:bg-foreground/26 data-[range-start=true]:bg-foreground/26 data-[range-end=true]:bg-foreground/26",
				"data-[selected-single=true]:text-foreground data-[range-start=true]:text-foreground data-[range-end=true]:text-foreground",
				"data-[range-end=true]:font-medium data-[range-start=true]:font-medium data-[selected-single=true]:font-medium",
				"data-[range-middle=true]:bg-transparent data-[range-middle=true]:hover:bg-transparent",
				// Round the outer edge of each endpoint only: a rounded edge on the side that
				// faces the band leaves a wedge of page showing through the seam.
				// A single-day chip keeps one radius wherever it sits in the row; the row-edge
				// rules below would otherwise round only the side that happens to be at the edge.
				"data-[selected-single=true]:rounded-md",
				"data-[range-middle=true]:rounded-none",
				"data-[range-start=true]:rounded-l-md data-[range-start=true]:rounded-r-none",
				"data-[range-end=true]:rounded-l-none data-[range-end=true]:rounded-r-md",
				"data-[outside=true]:text-muted-foreground",
				defaultClassNames.day,
				className,
			)}
			{...props}
		>
			{children}
			{modifiers.today && (
				<span
					aria-hidden="true"
					className="pointer-events-none absolute bottom-1 left-1/2 size-0.75 -translate-x-1/2 rounded-full bg-current opacity-60"
				/>
			)}
		</Button>
	);
}

export { Calendar, CalendarDayButton };
