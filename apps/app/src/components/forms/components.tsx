import { useStore } from "@tanstack/react-form";
import { createContext, useContext, useId } from "react";

import { Label } from "@hoalu/ui/label";
import { cn, useRender } from "@hoalu/ui/utils";

import { useFieldContext } from "./context";

interface FieldControlContextValue {
	id: string;
	formItemId: string;
	formDescriptionId: string;
	formErrorMessageId: string;
}
const FieldControlContext = createContext<FieldControlContextValue>({} as FieldControlContextValue);

function Field({ className, ...props }: React.ComponentProps<"div">) {
	const id = useId();
	const value = {
		id,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formErrorMessageId: `${id}-form-error-message`,
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

function FieldControl({ children }: { children?: useRender.RenderProp }) {
	const { formItemId, formDescriptionId, formErrorMessageId } = useFieldControlContext();
	const field = useFieldContext();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasErrors = errors.length > 0;

	return useRender({
		defaultTagName: "div",
		render: children,
		props: {
			id: formItemId,
			"aria-labelledby": formItemId,
			"aria-describedby": !hasErrors
				? `${formDescriptionId}`
				: `${formDescriptionId} ${formErrorMessageId}`,
			"aria-invalid": hasErrors,
		},
	});
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
	const { formItemId } = useFieldControlContext();
	const field = useFieldContext();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasErrors = errors?.length > 0;

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
	const { formErrorMessageId } = useFieldControlContext();
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
			id={formErrorMessageId}
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
