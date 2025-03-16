import { createFormHook } from "@tanstack/react-form";
import { ColorsField } from "./color";
import { fieldContext, formContext } from "./context";
import { DatepickerField } from "./datepicker";
import { Form } from "./form";
import { InputField } from "./input";
import { InputWithPrefixField } from "./input-with-prefix";
import { SelectField } from "./select";
import { SelectCategoryField } from "./select-category";
import { SelectWithGroupsField } from "./select-with-groups";
import { SelectWithSearchField } from "./select-with-search";
import { SwitchField } from "./switch";
import { TiptapField } from "./tiptap";
import { TransactionAmountField } from "./transaction-amount";

const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		InputField,
		InputWithPrefixField,
		SelectField,
		SelectWithSearchField,
		SelectWithGroupsField,
		SelectCategoryField,
		DatepickerField,
		TransactionAmountField,
		SwitchField,
		ColorsField,
		TiptapField,
	},
	formComponents: {
		Form,
	},
	fieldContext,
	formContext,
});

export { useAppForm, withForm };
