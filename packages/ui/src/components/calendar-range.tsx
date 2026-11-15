import * as React from "react";

import { Calendar } from "./calendar";

import type { DateRange } from "react-day-picker";

type CalendarProps = React.ComponentProps<typeof Calendar>;

interface RangeCalendarProps extends Omit<
	CalendarProps,
	"mode" | "selected" | "onSelect" | "required"
> {
	value: DateRange | undefined;
	/** Fires on every click. A first click reports `{ from }` with no `to`. */
	onChange: (range: DateRange | undefined) => void;
}

/**
 * A range is two clicks, but a calendar seeded with a range reports a *finished* range on every
 * click: `addToRange` reuses the seeded start, so the click that begins a new range is
 * indistinguishable from the one that ends it. This keeps the half-picked start, shows it, and
 * reports it without an end date, so a caller can tell "picking" from "picked" by `to` alone.
 *
 * `resetOnSelect` is what makes that first click start a new range instead of extending the old
 * one; it is not a prop here because every range picker needs the same answer.
 */
export function RangeCalendar({ value, onChange, ...props }: RangeCalendarProps) {
	/** A pending start only means something against the range it was picked from. */
	const [pending, setPending] = React.useState<{ from: Date; base: Date | undefined }>();

	const pendingFrom =
		pending && pending.base?.getTime() === value?.from?.getTime() ? pending.from : undefined;

	const handleSelect = (range: DateRange | undefined) => {
		setPending(range?.from && !range.to ? { from: range.from, base: value?.from } : undefined);
		onChange(range);
	};

	return (
		<Calendar
			mode="range"
			resetOnSelect
			selected={{
				from: pendingFrom ?? value?.from,
				to: pendingFrom ? undefined : value?.to,
			}}
			onSelect={handleSelect}
			{...props}
		/>
	);
}
