import { cn } from "@hoalu/ui/utils";
import { useId } from "react";
import { useFormContext } from "./context";

export function FieldSet({ id, className, ...props }: React.ComponentProps<"fieldset">) {
	const randomId = useId();
	const form = useFormContext();

	return (
		<form
			id={id ?? randomId}
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<fieldset disabled={isSubmitting} className={cn("grid gap-4", className)} {...props} />
				)}
			</form.Subscribe>
		</form>
	);
}
