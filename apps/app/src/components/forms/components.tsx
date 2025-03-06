import { Label, type LabelPrimitive } from "@hoalu/ui/label";
import { Slot } from "@hoalu/ui/slot";
import { cn } from "@hoalu/ui/utils";
import { useStore } from "@tanstack/react-form";
import { createContext, useContext, useId } from "react";
import { useFieldContext } from "./context";

interface FormItemContextValue {
	id: string;
	formItemId: string;
	formDescriptionId: string;
	formMessageId: string;
}
const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
	const id = useId();
	const value = {
		id,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
	};

	return (
		<FormItemContext.Provider value={value}>
			<div className={cn("flex flex-col gap-1.5", className)} {...props} />
		</FormItemContext.Provider>
	);
}

function FormControl(props: React.ComponentProps<typeof Slot>) {
	const { formItemId, formDescriptionId, formMessageId } = useContext(FormItemContext);
	const field = useFieldContext();
	const error = field.state.meta.errors.length > 0;

	return (
		<Slot
			id={formItemId}
			aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
			aria-invalid={error}
			{...props}
		/>
	);
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
	const { formItemId } = useContext(FormItemContext);
	const field = useFieldContext();
	const error = field.state.meta.errors.length > 0;

	return (
		<Label className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />
	);
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
	const { formDescriptionId } = useContext(FormItemContext);

	return (
		<p
			id={formDescriptionId}
			role="region"
			aria-live="polite"
			className={cn("text-[0.8rem] text-muted-foreground", className)}
			{...props}
		/>
	);
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
	const { formMessageId } = useContext(FormItemContext);
	const field = useFieldContext();
	const errors = useStore(field.store, (state) => state.meta.errors);

	if (!field.state.meta.isTouched || errors.length === 0) {
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
			{errors.join(", ")}
		</p>
	);
}

export { FormItem, FormControl, FormLabel, FormDescription, FormMessage };
