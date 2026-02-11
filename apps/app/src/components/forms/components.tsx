import {
	Field as UIField,
	FieldDescription as UIFieldDescription,
	FieldError as UIFieldError,
	FieldLabel as UIFieldLabel,
} from "@hoalu/ui/field";
import { cn, useRender } from "@hoalu/ui/utils";
import { createContext, useContext, useId } from "react";

import { useFieldContext } from "./context";

interface FieldControlContextValue {
	id: string;
	fieldItemId: string;
	fieldDescriptionId: string;
	fieldErrorMessageId: string;
}
const FieldControlContext = createContext<FieldControlContextValue>({} as FieldControlContextValue);

function Field({ className, ...props }: React.ComponentProps<"div">) {
	const id = useId();
	const field = useFieldContext();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const value: FieldControlContextValue = {
		id,
		fieldItemId: `${id}-form-item`,
		fieldDescriptionId: `${id}-form-item-description`,
		fieldErrorMessageId: `${id}-form-error-message`,
	};

	return (
		<FieldControlContext.Provider value={value}>
			<UIField
				data-invalid={isInvalid}
				orientation="vertical"
				className={cn("gap-2", className)}
				{...props}
			/>
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
	const { fieldItemId, fieldDescriptionId, fieldErrorMessageId } = useFieldControlContext();
	const field = useFieldContext();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return useRender({
		defaultTagName: "div",
		render: children,
		props: {
			id: fieldItemId,
			"aria-labelledby": fieldItemId,
			"aria-describedby": !isInvalid
				? `${fieldDescriptionId}`
				: `${fieldDescriptionId} ${fieldErrorMessageId}`,
			"aria-invalid": isInvalid,
		},
	});
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof UIFieldLabel>) {
	const { fieldItemId } = useFieldControlContext();

	return <UIFieldLabel htmlFor={fieldItemId} {...props} />;
}

function FieldDescription({
	className,
	...props
}: React.ComponentProps<typeof UIFieldDescription>) {
	const { fieldDescriptionId } = useFieldControlContext();

	return (
		<UIFieldDescription
			id={fieldDescriptionId}
			role="region"
			aria-live="polite"
			className={className}
			{...props}
		/>
	);
}

function FieldMessage({ className, children, ...props }: React.ComponentProps<"div">) {
	const { fieldErrorMessageId } = useFieldControlContext();
	const field = useFieldContext();

	return (
		<UIFieldError
			id={fieldErrorMessageId}
			errors={field.state.meta.errors}
			aria-live="polite"
			className={className}
			{...props}
		/>
	);
}

export { Field, FieldControl, FieldLabel, FieldDescription, FieldMessage, useFieldControlContext };
