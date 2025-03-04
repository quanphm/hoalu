import { cn } from "@hoalu/ui/utils";
import { useId } from "react";
import { useFormContext } from "./context";
import { withForm } from "./hooks";

export const Form = withForm({
	defaultValues: {
		email: "",
		password: "",
	},
	render: ({ form, children }) => {
		const id = useId();
		return (
			<form
				id={id}
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					<FieldSet>{children}</FieldSet>
				</form.AppForm>
			</form>
		);
	},
});

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<fieldset disabled={isSubmitting} className={cn("grid gap-4", className)} {...props} />
			)}
		</form.Subscribe>
	);
}
