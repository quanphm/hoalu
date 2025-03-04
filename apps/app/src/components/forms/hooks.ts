import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";
import { InputField } from "./input";

const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		InputField,
	},
	formComponents: {},
	fieldContext,
	formContext,
});

export { useAppForm, withForm };
