import { cn } from "@hoalu/ui/utils";
import { useId } from "react";
import { useFormContext } from "./context";

export function Form({ id, className, ...props }: React.ComponentProps<"fieldset">) {
	const randomId = useId();
	const form = useFormContext();

	return (
		<form
			id={id ?? randomId}
			onSubmit={(e) => {
				e.preventDefault();
				void form.handleSubmit();
			}}
		>
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<fieldset
						disabled={isSubmitting}
						className={cn("grid grid-cols-1 gap-4 [&:disabled_*]:opacity-100", className)}
						{...props}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
