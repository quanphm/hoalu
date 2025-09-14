import { NumberField as NumberFieldPrimitive } from "@base-ui-components/react/number-field";

function NumberField(props: React.ComponentProps<typeof NumberFieldPrimitive.Root>) {
	return <NumberFieldPrimitive.Root data-slot="number-field" {...props} />;
}

function NumberFieldGroup(props: React.ComponentProps<typeof NumberFieldPrimitive.Group>) {
	return <NumberFieldPrimitive.Group data-slot="number-field-group" {...props} />;
}

function NumberFieldDecrement(props: React.ComponentProps<typeof NumberFieldPrimitive.Decrement>) {
	return <NumberFieldPrimitive.Decrement data-slot="number-field-decrement" {...props} />;
}

function NumberFieldInput(props: React.ComponentProps<typeof NumberFieldPrimitive.Input>) {
	return <NumberFieldPrimitive.Input data-slot="number-field-input" {...props} />;
}

function NumberFieldIncrement(props: React.ComponentProps<typeof NumberFieldPrimitive.Increment>) {
	return <NumberFieldPrimitive.Increment data-slot="number-field-decrement" {...props} />;
}

export {
	NumberField,
	NumberFieldGroup,
	NumberFieldDecrement,
	NumberFieldInput,
	NumberFieldIncrement,
};
