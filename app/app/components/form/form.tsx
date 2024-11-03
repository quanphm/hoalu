import { Form } from "@trekapply/ui/form";
import type { ComponentProps } from "react";
import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";

interface HookFormProps<T extends FieldValues> extends Omit<ComponentProps<"form">, "onSubmit"> {
	form: UseFormReturn<T>;
	onSubmit: SubmitHandler<T>;
	disabled?: boolean | undefined;
	className?: string | undefined;
	children: React.ReactNode;
}

export const HookForm = <T extends FieldValues>({
	form,
	onSubmit,
	disabled,
	className,
	children,
}: HookFormProps<T>) => {
	const { isSubmitting } = form.formState;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<fieldset disabled={isSubmitting || disabled} className={className}>
					{children}
				</fieldset>
			</form>
		</Form>
	);
};
