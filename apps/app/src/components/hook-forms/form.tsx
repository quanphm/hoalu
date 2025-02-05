import { cn } from "@hoalu/ui/utils";
import type { ComponentProps } from "react";
import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { Form } from "./components";

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
	id,
}: HookFormProps<T>) => {
	const { isSubmitting } = form.formState;

	return (
		<Form {...form}>
			<form id={id} onSubmit={form.handleSubmit(onSubmit)}>
				<fieldset disabled={isSubmitting || disabled} className={cn("grid gap-4", className)}>
					{children}
				</fieldset>
			</form>
		</Form>
	);
};
