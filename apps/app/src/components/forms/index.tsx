import { createFormHook } from "@tanstack/react-form";

import { ColorsField } from "./color";
import { fieldContext, formContext } from "./context";
import { DateChipField } from "./date-chip";
import { DatepickerInputField } from "./datepicker-input";
import { Form } from "./form";
import { InputField } from "./input";
import { InputWithEmojiPickerField } from "./input-with-emoji-picker";
import { InputWithPrefixField } from "./input-with-prefix";
import { SelectField } from "./select";
import { SelectCategoryField } from "./select-category";
import { SelectEventField } from "./select-event";
import { SelectRecurringBillField } from "./select-recurring-bill";
import { SelectWithGroupsField } from "./select-with-groups";
import { SelectWithSearchField } from "./select-with-search";
import { SubscribeButton } from "./subscribe-button";
import { TiptapField } from "./tiptap";
import { TransactionAmountField, TransactionAmountHeroField } from "./transaction-amount";

const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		InputField,
		InputWithPrefixField,
		InputWithEmojiPickerField,
		SelectField,
		SelectWithSearchField,
		SelectWithGroupsField,
		SelectCategoryField,
		SelectEventField,
		SelectRecurringBillField,
		DateChipField,
		DatepickerInputField,
		TransactionAmountField,
		TransactionAmountHeroField,
		ColorsField,
		TiptapField,
	},
	formComponents: {
		Form,
		SubscribeButton,
	},
	fieldContext,
	formContext,
});

export { useAppForm, withForm };
