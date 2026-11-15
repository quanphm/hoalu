import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { useId } from "react";

import { EmojiPicker } from "#app/components/emoji-picker.tsx";
import { Field, FieldControl, FieldMessage } from "#app/components/forms/components.tsx";
import { withForm } from "#app/components/forms/index.tsx";
import { PillPicker } from "#app/components/forms/pill-picker.tsx";
import {
	BorderlessTitleInput,
	TransactionPageGrid,
	TransactionSubmitRow,
} from "#app/components/transactions/transaction-layout.tsx";
import {
	TransactionMetaRow,
	TransactionPanel,
} from "#app/components/transactions/transaction-meta.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { AVAILABLE_CATEGORY_TYPE_OPTIONS } from "#app/helpers/constants.ts";
import { joinEmojiTitle, splitEmojiTitle } from "#app/helpers/emoji.ts";

import type { CategoryFormSchema } from "#app/lib/schema.ts";
import type { ColorSchema } from "@hoalu/schema/schema";

const BLANK_CATEGORY: CategoryFormSchema = {
	name: "🔮 Magic",
	description: "",
	color: "purple",
	type: "expense",
};

/**
 * A category is a name with a leading emoji, a colour, a type, and a one-line description. Same
 * card as the rest: title, a pill for the type, the colour grid, then the description.
 */
export const CategoryFields = withForm({
	defaultValues: BLANK_CATEGORY,
	props: {} as {
		formId: string;
		submitLabel: string;
		/** The in-form quick-add knows its type, so it does not offer the choice. */
		showType?: boolean;
		/** Create has no baseline to be dirty against, so only edit shows the note. */
		showDirty?: boolean;
	},
	render: ({ form, formId, submitLabel, showType = true, showDirty }) => {
		const nameId = useId();

		return (
			<form.Form id={formId}>
				<TransactionPageGrid
					keepAsideColumn
					main={
						<div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
							<form.AppField
								name="name"
								validators={{
									onSubmit: ({ value }) =>
										splitEmojiTitle(value).title.trim()
											? undefined
											: { message: "Give this category a name" },
								}}
								children={(field) => {
									const { emoji, title } = splitEmojiTitle(field.state.value);
									const setTitle = (nextTitle: string) =>
										field.handleChange(joinEmojiTitle(emoji, nextTitle));

									return (
										<Field>
											<FieldControl>
												<div className="flex items-center gap-2">
													<EmojiPicker
														emoji={emoji}
														size="icon-sm"
														onEmojiSelect={(nextEmoji) =>
															field.handleChange(joinEmojiTitle(nextEmoji, title))
														}
														onEmojiClear={() => field.handleChange(joinEmojiTitle(null, title))}
													/>
													<BorderlessTitleInput
														id={nameId}
														name={field.name}
														value={title}
														onBlur={field.handleBlur}
														onChange={(e) => setTitle(e.target.value)}
														onKeyDown={(e) => {
															if (e.key !== "Enter") return;
															e.preventDefault();
															void form.handleSubmit();
														}}
														placeholder="Untitled category"
														aria-label="Category name"
														autoFocus
													/>
												</div>
											</FieldControl>
											<FieldMessage />
										</Field>
									);
								}}
							/>

							<TransactionMetaRow>
								{showType && (
									<form.AppField name="type">
										{(typeField) => (
											<PillPicker
												options={AVAILABLE_CATEGORY_TYPE_OPTIONS}
												value={typeField.state.value}
												onValueChange={typeField.handleChange}
												placeholder="Type"
												searchable={false}
												popupClassName="w-40"
											/>
										)}
									</form.AppField>
								)}
							</TransactionMetaRow>

							<TransactionPanel>
								<div className="flex flex-wrap items-start gap-x-8 gap-y-4">
									<div className="w-fit">
										<form.AppField
											name="color"
											children={(field) => <field.ColorsField label="Color" />}
										/>
									</div>
									<div aria-hidden="true" className="flex flex-col gap-2">
										<span className="text-sm font-medium">Preview</span>
										<div className="flex h-6 items-center">
											<form.Subscribe selector={(s) => s.values.color}>
												{(color) => (
													<form.Subscribe selector={(s) => s.values.name}>
														{(name) => (
															<Badge className={cn(createCategoryTheme(color as ColorSchema))}>
																{name || <>&nbsp;</>}
															</Badge>
														)}
													</form.Subscribe>
												)}
											</form.Subscribe>
										</div>
									</div>
								</div>
							</TransactionPanel>

							<TransactionPanel>
								<form.AppField
									name="description"
									children={(field) => (
										<field.InputField
											label="Description"
											placeholder="Groceries, restaurants, cafés"
											autoComplete="off"
										/>
									)}
								/>
							</TransactionPanel>

							<TransactionSubmitRow
								status={
									showDirty ? (
										<form.Subscribe selector={(s) => s.isDirty}>
											{(isDirty) => (isDirty ? "Unsaved changes" : null)}
										</form.Subscribe>
									) : null
								}
							>
								<form.SubscribeButton>{submitLabel}</form.SubscribeButton>
							</TransactionSubmitRow>
						</div>
					}
				/>
			</form.Form>
		);
	},
});
