import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";
import { DatepickerField } from "./datepicker";
import { Form } from "./form";
import { InputField } from "./input";
import { InputWithPrefixField } from "./input-with-prefix";
import { SelectField } from "./select";
import { TransactionAmountField } from "./transaction-amount";

const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		InputField,
		InputWithPrefixField,
		SelectField,
		DatepickerField,
		TransactionAmountField,
	},
	formComponents: {
		Form,
	},
	fieldContext,
	formContext,
});

export { useAppForm, withForm };
