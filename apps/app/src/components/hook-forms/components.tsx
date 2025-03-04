import { Label } from "@hoalu/ui/label";
import { Slot } from "@hoalu/ui/slot";
import { cn } from "@hoalu/ui/utils";
import type * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
} from "react-hook-form";

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<div className={cn("flex flex-col gap-1.5", className)} {...props} />
		</FormItemContext.Provider>
	);
};
FormItem.displayName = "FormItem";

const FormLabel = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof LabelPrimitive.Root>) => {
	const { error, formItemId } = useFormField();

	return (
		<Label className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />
	);
};
FormLabel.displayName = "FormLabel";

const FormControl = (props: React.ComponentPropsWithRef<typeof Slot>) => {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

	return (
		<Slot
			id={formItemId}
			aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
			aria-invalid={!!error}
			{...props}
		/>
	);
};
FormControl.displayName = "FormControl";

const FormDescription = ({ className, ...props }: React.ComponentPropsWithRef<"p">) => {
	const { formDescriptionId } = useFormField();

	return (
		<p
			id={formDescriptionId}
			role="region"
			aria-live="polite"
			className={cn("text-[0.8rem] text-muted-foreground", className)}
			{...props}
		/>
	);
};
FormDescription.displayName = "FormDescription";

const FormMessage = ({ className, children, ...props }: React.ComponentPropsWithRef<"p">) => {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message) : children;

	if (!body) {
		return null;
	}

	return (
		<p
			id={formMessageId}
			role="alert"
			aria-live="polite"
			className={cn("text-destructive text-sm", className)}
			{...props}
		>
			{body}
		</p>
	);
};
FormMessage.displayName = "FormMessage";

export {
	useFormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField,
};
