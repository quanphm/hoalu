import { Label, type LabelPrimitive } from "@hoalu/ui/label";
import { Slot as SlotPrimitive } from "@hoalu/ui/slot";
import { cn } from "@hoalu/ui/utils";
import { useStore } from "@tanstack/react-form";
import { createContext, useContext, useId } from "react";
import { useFieldContext } from "./context";

interface FieldControlContextValue {
	id: string;
	formItemId: string;
	formDescriptionId: string;
	formMessageId: string;
}
const FieldControlContext = createContext<FieldControlContextValue>({} as FieldControlContextValue);

function Field({ className, ...props }: React.ComponentProps<"div">) {
	const id = useId();
	const value = {
		id,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
	};

	return (
		<FieldControlContext.Provider value={value}>
			<div className={cn("flex flex-col gap-1.5", className)} {...props} />
		</FieldControlContext.Provider>
	);
}

function useFieldControlContext() {
	const context = useContext(FieldControlContext);
	if (!context) {
		throw new Error("Hook `useFieldControlContext` should be used within <Field>.");
	}
	return context;
}

function FieldControl(props: React.ComponentProps<typeof SlotPrimitive.Slot>) {
	const { formItemId, formDescriptionId, formMessageId } = useFieldControlContext();
	const field = useFieldContext();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasErrors = errors.length > 0;

	return (
		<SlotPrimitive.Slot
			id={formItemId}
			aria-labelledby={formItemId}
			aria-describedby={
				!hasErrors ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={hasErrors}
			{...props}
		/>
	);
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
	const { formItemId } = useFieldControlContext();
	const field = useFieldContext();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasErrors = errors.length > 0;

	return (
		<Label
			className={cn(hasErrors && "text-destructive", className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
	const { formDescriptionId } = useFieldControlContext();

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
	const { formMessageId } = useFieldControlContext();
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

export { Field, FieldControl, FieldLabel, FieldDescription, FieldMessage, useFieldControlContext };
