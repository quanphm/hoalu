import { PlusIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { CreateRecurringBillForm } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import { useLiveQueryRecurringBills } from "#app/components/recurring-bills/use-recurring-bills.ts";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";
import { PillPicker, type PillOption } from "./pill-picker";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;
	appearance?: "pill" | "field";
	/**
	 * `navigate` sends the user to the bill page and back with the new id, which the host form
	 * can only afford when it keeps a draft. Hosts without one keep the in-place dialog.
	 */
	createAction?: "dialog" | "navigate";
	disabled?: boolean;
	/**
	 * Filter bills by repeat cadence to only show relevant bills.
	 * e.g. repeat="monthly" will only show monthly bills.
	 * If omitted, all bills are shown.
	 */
	repeat?: string;
	/** Pre-fill the "Create new bill" form with these values. */
	defaultDate?: string;
}

export function SelectRecurringBillField(props: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const field = useFieldContext<string | undefined>();
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const bills = useLiveQueryRecurringBills();
	const filtered = props.repeat ? bills.filter((bill) => bill.repeat === props.repeat) : bills;

	const options: PillOption[] = [
		{ value: "", label: "No bill" },
		...filtered.map((bill) => ({ value: bill.id, label: bill.title })),
	];

	const placeholder =
		props.placeholder ?? (typeof props.label === "string" ? props.label : "Recurring bill");

	return (
		<Field className={props.appearance === "field" ? "gap-1" : "w-fit! gap-1 [&>*]:w-auto!"}>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<PillPicker
					options={options}
					value={field.state.value ?? ""}
					onValueChange={(value) => field.handleChange(value || undefined)}
					placeholder={placeholder}
					appearance={props.appearance}
					searchPlaceholder="Search bills…"
					disabled={props.disabled}
					emptyMessage="No bills found."
					footer={
						props.createAction === "navigate" ? (
							<Button
								variant="ghost"
								className="w-full justify-start"
								render={
									<Link
										to="/$slug/recurring-bills/new"
										params={{ slug }}
										search={{ returnTo: "transaction" }}
									/>
								}
							>
								<PlusIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
								Set up recurring bill
							</Button>
						) : (
							<DialogTrigger render={<Button variant="ghost" className="w-full justify-start" />}>
								<PlusIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
								Set up recurring bill
							</DialogTrigger>
						)
					}
				/>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Set up recurring bill</DialogTitle>
						<DialogDescription>Track this as a recurring payment going forward.</DialogDescription>
					</DialogHeader>
					<CreateRecurringBillForm
						defaultDate={props.defaultDate}
						onSuccess={(newBillId?: string) => {
							field.handleChange(newBillId || undefined);
							setDialogOpen(false);
						}}
					/>
				</DialogContent>
			</Dialog>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
