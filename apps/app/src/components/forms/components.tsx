import { Label, type LabelPrimitive } from "@hoalu/ui/label";
import { Slot } from "@hoalu/ui/slot";
import { cn } from "@hoalu/ui/utils";
import { useStore } from "@tanstack/react-form";
import { createContext, useContext, useId } from "react";
import { useFieldContext } from "./context";

interface FieldContextValue {
	id: string;
	formItemId: string;
	formDescriptionId: string;
	formMessageId: string;
}
const FieldContext = createContext<FieldContextValue>({} as FieldContextValue);

function Field({ className, ...props }: React.ComponentProps<"div">) {
	const id = useId();
	const value = {
		id,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
	};

	return (
		<FieldContext.Provider value={value}>
			<div className={cn("flex flex-col gap-1.5", className)} {...props} />
		</FieldContext.Provider>
	);
}

function FieldControl(props: React.ComponentProps<typeof Slot>) {
	const { formItemId, formDescriptionId, formMessageId } = useContext(FieldContext);
	const field = useFieldContext();
	const error = field.state.meta.errors.length > 0;

	return (
		<Slot
			id={formItemId}
			aria-labelledby={formItemId}
			aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
			aria-invalid={error}
			{...props}
		/>
	);
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
	const { formItemId } = useContext(FieldContext);
	const field = useFieldContext();
	const error = field.state.meta.errors.length > 0;

	return (
		<Label className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />
	);
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
	const { formDescriptionId } = useContext(FieldContext);

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

function FieldMessage({ className, children, ...props }: React.ComponentProps<"p">) {
	const { formMessageId } = useContext(FieldContext);
	const field = useFieldContext();
	const errors = useStore(field.store, (state) => state.meta.errors);

	const isTouched = field.state.meta.isTouched;
	const hasErrors = errors.length > 0;

	const formatErrorMessage = (error: unknown) => {
		if (typeof error === "string") return error;
		if (error instanceof Error) return error.message;
		if (typeof error === "object" && error !== null && "message" in error) {
			return String(error.message);
		}
		return String(`Unhandled error format: ${JSON.stringify(error)}`);
	};

	const formattedErrorMessages = errors.map(formatErrorMessage).join(", ");
	const body = isTouched && hasErrors ? formattedErrorMessages : children;

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
			{errors.join(", ")}
		</p>
	);
}

export { Field, FieldControl, FieldLabel, FieldDescription, FieldMessage };
