import { FieldGroup, FieldSet } from "@hoalu/ui/field";
import { cn } from "@hoalu/ui/utils";
import { useId } from "react";

import { useFormContext } from "./context";

export function Form({ id, className, ...props }: React.ComponentProps<"fieldset">) {
	const reactId = useId();
	const form = useFormContext();

	return (
		<form
			id={id ?? reactId}
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<FieldSet
							disabled={isSubmitting}
							className={cn("grid grid-cols-1 gap-6 [&:disabled_*]:opacity-100", className)}
							{...props}
						/>
					)}
				</form.Subscribe>
			</FieldGroup>
		</form>
	);
}
