import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";
import { Form } from "./form";
import { InputField } from "./input";
import { InputWithPrefixField } from "./input-with-prefix";

const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		InputField,
		InputWithPrefixField,
	},
	formComponents: {
		FieldSet: Form,
		Form,
	},
	fieldContext,
	formContext,
});

export { useAppForm, withForm };
