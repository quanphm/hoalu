import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect, useState } from "react";

import { datetime } from "@hoalu/common/datetime";
import { TrashIcon } from "@hoalu/icons/lucide";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@hoalu/ui/accordion";
import { Button } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { createExpenseDialogOpenAtom, draftExpenseAtom, selectedExpenseAtom } from "@/atoms";
import { useAppForm } from "@/components/forms";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { WarningMessage } from "@/components/warning-message";
import { AVAILABLE_REPEAT_OPTIONS, KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { ExpenseFormSchema } from "@/lib/schema";
import {
	useCreateExpense,
	useDeleteExpense,
	useEditExpense,
	useUploadExpenseFiles,
} from "@/services/mutations";
import { expenseWithIdQueryOptions, walletsQueryOptions } from "@/services/query-options";

const routeApi = getRouteApi("/_dashboard/$slug");
const expenseRouteApi = getRouteApi("/_dashboard/$slug/expenses");

export function CreateExpenseDialog({ children }: { children?: React.ReactNode }) {
	const [dialog, setOpen] = useAtom(createExpenseDialogOpenAtom);

	return (
		<Dialog open={dialog.isOpen} onOpenChange={setOpen}>
			{children}
			<DialogContent className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
				<DialogHeader>
					<DialogTitle>Create new expense</DialogTitle>
				</DialogHeader>
				<DialogDescription>Add a new transaction to track your spending.</DialogDescription>
				<CreateExpenseForm />
			</DialogContent>
		</Dialog>
	);
}

export function CreateExpenseDialogTrigger({ children }: { children: React.ReactNode }) {
	const setOpen = useSetAtom(createExpenseDialogOpenAtom);

	return (
		<HotKeyWithTooltip onClick={() => setOpen(true)} shortcut={KEYBOARD_SHORTCUTS.create_expense}>
			{children}
		</HotKeyWithTooltip>
	);
}

function CreateExpenseForm() {
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const mutation = useCreateExpense();
	const expenseFilesMutation = useUploadExpenseFiles();

	const setOpen = useSetAtom(createExpenseDialogOpenAtom);
	const [draft, setDraft] = useAtom(draftExpenseAtom);

	const fallbackWallet = {
		label: wallets[0].name,
		value: wallets[0].id,
		currency: wallets[0].currency,
	};
	const walletGroups = wallets.reduce(
		(result, current) => {
			const owner = current.owner;
			if (!current.isActive) {
				return result;
			}
			if (!result[owner.id]) {
				result[owner.id] = {
					name: owner.name,
					options: [
						{
							label: current.name,
							value: current.id,
							currency: current.currency,
						},
					],
				};
			} else {
				result[owner.id].options.push({
					label: current.name,
					value: current.id,
					currency: current.currency,
				});
			}
			return result;
		},
		{} as Record<
			string,
			{ name: string; options: { label: string; value: string; currency: string }[] }
		>,
	);
	const defaultWallet = walletGroups[user?.id]?.options[0] || fallbackWallet;

	const form = useAppForm({
		defaultValues: {
			title: draft.title,
			description: draft.description,
			date: draft.date,
			transaction: {
				value: draft.transaction.value,
				currency: draft.transaction.currency || defaultWallet.currency,
			},
			walletId: draft.walletId || defaultWallet.value,
			categoryId: draft.categoryId,
			repeat: draft.repeat,
			attachments: [],
		} as ExpenseFormSchema,
		validators: {
			onSubmit: ExpenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			const expense = await mutation.mutateAsync({
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
					repeat: value.repeat,
				},
			});
			setDraft(RESET);
			setOpen(false);
			if (value.attachments.length > 0) {
				await expenseFilesMutation.mutateAsync({
					...expense,
					files: value.attachments,
				});
			}
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: shut up
	useEffect(() => {
		return () => {
			if (!form.state.isSubmitted) {
				setDraft(form.state.values);
			}
		};
	}, [form.state.isSubmitted]);

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-7 flex flex-col gap-4">
						<form.AppField name="title">
							{(field) => <field.InputField label="Description" autoFocus required />}
						</form.AppField>
						<form.AppField name="transaction">
							{(field) => <field.TransactionAmountField label="Amount" />}
						</form.AppField>
						<div className="grid grid-cols-2 gap-4">
							<form.AppField name="walletId">
								{(field) => <field.SelectWithGroupsField label="Wallet" groups={walletGroups} />}
							</form.AppField>
							<form.AppField name="categoryId">
								{(field) => <field.SelectCategoryField label="Category" />}
							</form.AppField>
						</div>
						<form.AppField name="description">
							{(field) => <field.TiptapField label="Note" defaultValue={draft.description} />}
						</form.AppField>
					</div>
					<div className="col-span-5 flex flex-col gap-2.5">
						<form.AppField name="date">
							{(field) => <field.DatepickerInputField label="Date" />}
						</form.AppField>
						<form.AppField name="date">{(field) => <field.DatepickerField />}</form.AppField>
					</div>
					<div className="col-span-12">
						<Accordion type="single" collapsible className="w-full" defaultValue="advanced">
							<AccordionItem
								value="advanced"
								className="relative overflow-auto rounded-md border bg-background outline-none last:border-b has-focus-visible:z-10 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
							>
								<AccordionTrigger className="rounded-none bg-muted px-4 py-2">
									More
								</AccordionTrigger>
								<AccordionContent className="grid grid-cols-12 gap-4 px-4 py-4">
									<div className="col-span-5 flex flex-col gap-4">
										<form.AppField name="repeat">
											{(field) => (
												<field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />
											)}
										</form.AppField>
									</div>
									<div className="col-span-7 flex flex-col gap-4">
										<form.AppField name="attachments">
											{(field) => <field.FilesField label="Attachments" />}
										</form.AppField>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
				<div className="ml-auto flex gap-2">
					<Button
						variant="ghost"
						type="button"
						onClick={() => {
							setDraft(RESET);
							form.reset();
						}}
					>
						Reset
					</Button>
					<Button type="submit">Create expense</Button>
				</div>
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteExpense({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const setSelectedExpense = useSetAtom(selectedExpenseAtom);
	const mutation = useDeleteExpense();

	const onDelete = async () => {
		await mutation.mutateAsync({ id });
		setOpen(false);
		setSelectedExpense({ id: null });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="icon" variant="destructive" aria-label="Delete this expense">
					<TrashIcon className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Delete this expense?</DialogTitle>
					<DialogDescription>
						<WarningMessage>
							The expense will be deleted and removed from your history. This action cannot be
							undone.
						</WarningMessage>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={() => onDelete()}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function EditExpenseForm(props: { id: string; className?: string }) {
	const workspace = useWorkspace();
	const mutation = useEditExpense();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(workspace.slug));
	const { data: expense, status } = useQuery(expenseWithIdQueryOptions(workspace.slug, props.id));

	const walletGroups = wallets.reduce(
		(result, current) => {
			const owner = current.owner;
			if (!current.isActive) {
				return result;
			}
			if (!result[owner.id]) {
				result[owner.id] = {
					name: owner.name,
					options: [
						{
							label: current.name,
							value: current.id,
							currency: current.currency,
						},
					],
				};
			} else {
				result[owner.id].options.push({
					label: current.name,
					value: current.id,
					currency: current.currency,
				});
			}
			return result;
		},
		{} as Record<
			string,
			{ name: string; options: { label: string; value: string; currency: string }[] }
		>,
	);

	const form = useAppForm({
		defaultValues: {
			title: expense?.title ?? "",
			description: expense?.description ?? "",
			date: expense?.date ?? "",
			transaction: {
				value: expense?.amount ?? 0,
				currency: expense?.currency ?? workspace.metadata.currency,
			},
			walletId: expense?.wallet.id ?? "",
			categoryId: expense?.category?.id ?? "",
			repeat: expense?.repeat ?? "one-time",
			attachments: [],
		} as ExpenseFormSchema,
		validators: {
			onSubmit: ExpenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: props.id,
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
					repeat: value.repeat,
				},
			});
		},
	});

	useEffect(() => {
		if (status === "success") {
			form.reset();
		}
	}, [status, form.reset]);

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="date">
					{(field) => <field.DatepickerInputField label="Date" />}
				</form.AppField>
				<form.AppField name="title">
					{(field) => <field.InputField label="Description" required />}
				</form.AppField>
				<form.AppField name="transaction">
					{(field) => <field.TransactionAmountField label="Amount" />}
				</form.AppField>
				<div className="grid grid-cols-2 gap-4">
					<form.AppField name="walletId">
						{(field) => <field.SelectWithGroupsField label="Wallet" groups={walletGroups} />}
					</form.AppField>
					<form.AppField name="categoryId">
						{(field) => <field.SelectCategoryField label="Category" />}
					</form.AppField>
				</div>
				<form.AppField name="description">
					{(field) => <field.TiptapField label="Note" defaultValue={expense?.description ?? ""} />}
				</form.AppField>
				<form.AppField name="repeat">
					{(field) => <field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />}
				</form.AppField>
				<form.AppField name="attachments">
					{(field) => <field.FilesField label="Attachments" />}
				</form.AppField>
				<div className="ml-auto flex gap-2">
					<Button variant="ghost" type="button" onClick={() => form.reset()} tabIndex={-1}>
						Reset
					</Button>
					<Button type="submit">Update</Button>
				</div>
			</form.Form>
		</form.AppForm>
	);
}

export function ExpenseCalendar() {
	const { date: searchDate } = expenseRouteApi.useSearch();
	const navigate = expenseRouteApi.useNavigate();

	const currentSelectedDate = searchDate ? new Date(searchDate) : undefined;

	return (
		<Calendar
			mode="single"
			className="-mx-2"
			selected={currentSelectedDate}
			onSelect={(selectedDate) => {
				navigate({
					search: () => ({
						date: selectedDate ? datetime.format(selectedDate, "yyyy-MM-dd") : undefined,
					}),
				});
			}}
		/>
	);
}
