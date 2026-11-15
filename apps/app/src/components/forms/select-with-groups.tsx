import { cn } from "@hoalu/ui/utils";

import { createWalletTheme } from "#app/helpers/colors.ts";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";
import { PillPicker, type PillOption, type PillSection } from "./pill-picker";

import type { WalletGroups } from "#app/components/wallets/use-wallets.ts";

interface Props {
	groups: WalletGroups;
	label?: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;
	appearance?: "pill" | "field";
	disabled?: boolean;
}

export function SelectWithGroupsField(props: Props) {
	const field = useFieldContext<string>();
	const ownerGroups = Object.entries(props.groups).filter(([, group]) => group.options.length > 0);
	const option = (wallet: WalletGroups[string]["options"][number]): PillOption => ({
		value: wallet.value,
		label: wallet.label,
		icon: (
			<span
				aria-hidden="true"
				className={cn("size-2 shrink-0 rounded-full", createWalletTheme(wallet.type))}
			/>
		),
	});

	const options = ownerGroups.flatMap(([, group]) => group.options.map(option));
	const sections: PillSection[] | undefined =
		ownerGroups.length > 1
			? ownerGroups.map(([, group]) => ({
					label: group.name,
					options: group.options.map(option),
				}))
			: undefined;

	const placeholder =
		props.placeholder ?? (typeof props.label === "string" ? props.label : "Wallet");

	if (options.length === 0) return null;

	return (
		<Field className={props.appearance === "field" ? "gap-1" : "w-fit! gap-1 [&>*]:w-auto!"}>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<PillPicker
				options={options}
				sections={sections}
				value={field.state.value}
				onValueChange={(value) => value && field.handleChange(value)}
				placeholder={placeholder}
				appearance={props.appearance}
				searchPlaceholder="Search wallets…"
				disabled={props.disabled}
				emptyMessage="No wallet found."
			/>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
