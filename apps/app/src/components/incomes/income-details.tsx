import { type IncomeClient, useSelectedIncome } from "#app/components/incomes/use-incomes.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { useEditIncome } from "#app/services/mutations.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	Trash2Icon,
} from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useAppForm } from "#app/components/forms/index.tsx";
import { FieldGroup } from "@hoalu/ui/field";
import { IncomeFormSchema } from "#app/lib/schema.ts";
import { Badge } from "@hoalu/ui/badge";
import { useSetAtom } from "jotai";
import { deleteIncomeDialogAtom } from "#app/atoms/dialogs.ts";

interface IncomeDetailsProps {
	incomes: IncomeClient[];
}

function useIncomeNavigation({
	incomes,
	selectedId,
	onSelectIncome,
}: {
	incomes: IncomeClient[];
	selectedId: string | null;
	onSelectIncome: (id: string | null) => void;
}) {
	const currentIndex = incomes.findIndex((i) => i.id === selectedId);
	const currentIncome = currentIndex >= 0 ? incomes[currentIndex] : null;

	const handleGoUp = () => {
		if (currentIndex > 0) {
			onSelectIncome(incomes[currentIndex - 1].id);
		}
	};

	const handleGoDown = () => {
		if (currentIndex < incomes.length - 1) {
			onSelectIncome(incomes[currentIndex + 1].id);
		}
	};

	return {
		currentIncome,
		handleGoUp,
		handleGoDown,
		canGoUp: currentIndex > 0,
		canGoDown: currentIndex < incomes.length - 1,
	};
}

function EditIncomeForm({ data }: { data: IncomeClient }) {
	const mutation = useEditIncome();
	const wallets = useLiveQueryWallets();

	const walletOptions = wallets
		.filter((w) => w.isActive)
		.map((w) => ({
			label: w.name,
			value: w.id,
		}));

	const form = useAppForm({
		defaultValues: {
			title: data.title,
			description: data.description ?? "",
			transaction: { value: data.amount, currency: data.currency },
			date: data.date,
			walletId: data.wallet.id,
			categoryId: data.category?.id ?? "",
		} as IncomeFormSchema,
		validators: {
			onSubmit: IncomeFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: data.id,
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
				},
			});
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="p-4">
					<form.AppField name="title" children={(field) => <field.InputField label="Title" />} />
					<form.AppField
						name="transaction"
						children={(field) => <field.TransactionAmountField label="Amount" />}
					/>
					<div className="grid grid-cols-2 gap-4">
						<form.AppField
							name="walletId"
							children={(field) => <field.SelectField label="Wallet" options={walletOptions} />}
						/>
						<form.AppField
							name="categoryId"
							children={(field) => <field.SelectCategoryField label="Category" type="income" />}
						/>
					</div>
					<form.AppField
						name="date"
						children={(field) => <field.DatepickerInputField label="Date" />}
					/>
					<form.AppField
						name="description"
						children={(field) => <field.TiptapField label="Description" />}
					/>
				</FieldGroup>
				<DialogFooter className="px-4 pb-4">
					<form.SubscribeButton>Save changes</form.SubscribeButton>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

export function IncomeDetails({ incomes }: IncomeDetailsProps) {
	const { income: selectedRow, onSelectIncome } = useSelectedIncome();
	const { currentIncome, handleGoUp, handleGoDown, canGoUp, canGoDown } = useIncomeNavigation({
		incomes,
		selectedId: selectedRow.id,
		onSelectIncome,
	});
	const setDeleteDialog = useSetAtom(deleteIncomeDialogAtom);

	return (
		<div className="bg-card text-card-foreground flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
			{currentIncome && (
				<div
					data-slot="income-details-actions"
					className="bg-card sticky top-0 z-10 flex justify-between border-b px-4 py-2"
				>
					<div className="flex items-center justify-center gap-2">
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="outline"
										onClick={handleGoDown}
										disabled={!canGoDown}
									/>
								}
							>
								<ChevronDownIcon className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">
								Down <HotKey className="ml-2" label="J" />
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button size="icon" variant="outline" onClick={handleGoUp} disabled={!canGoUp} />
								}
							>
								<ChevronUpIcon className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">
								Up <HotKey className="ml-2" label="K" />
							</TooltipContent>
						</Tooltip>
					</div>
					<div className="flex items-center justify-center gap-2">
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="outline"
										onClick={() => setDeleteDialog({ state: true })}
									>
										<Trash2Icon className="size-4" />
									</Button>
								}
							>
								<TooltipContent side="bottom">Delete</TooltipContent>
							</TooltipTrigger>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button size="icon" variant="outline" onClick={() => onSelectIncome(null)} />
								}
							>
								<XIcon className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">Close</TooltipContent>
						</Tooltip>
					</div>
				</div>
			)}
			<div data-slot="income-details-form">
				{currentIncome ? (
					<>
						<div className="border-b p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Amount</p>
									<p className="text-2xl font-semibold text-green-600">
										+{formatCurrency(currentIncome.convertedAmount, "USD")}
									</p>
								</div>
								{currentIncome.category && (
									<Badge className={createCategoryTheme(currentIncome.category.color)}>
										{currentIncome.category.name}
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground mt-2">
								Wallet: {currentIncome.wallet.name}
							</p>
						</div>
						<EditIncomeForm key={currentIncome.id} data={currentIncome} />
					</>
				) : (
					<h2 className="bg-muted/50 text-muted-foreground m-4 rounded-md p-4 text-center">
						No income selected
					</h2>
				)}
			</div>
		</div>
	);
}

export function MobileIncomeDetails({ incomes }: IncomeDetailsProps) {
	const { income: selectedRow, onSelectIncome } = useSelectedIncome();
	const { currentIncome, handleGoUp, handleGoDown, canGoUp, canGoDown } = useIncomeNavigation({
		incomes,
		selectedId: selectedRow.id,
		onSelectIncome,
	});

	const isOpen = !!currentIncome;

	function handleClose() {
		onSelectIncome(null);
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Income Details</DialogTitle>
					<DialogHeaderAction>
						<Button size="icon" variant="outline" onClick={handleGoUp} disabled={!canGoUp}>
							<ChevronUpIcon className="size-4" />
						</Button>
						<Button size="icon" variant="outline" onClick={handleGoDown} disabled={!canGoDown}>
							<ChevronDownIcon className="size-4" />
						</Button>
					</DialogHeaderAction>
				</DialogHeader>
				<ScrollArea className="max-h-[90vh]">
					{currentIncome && <EditIncomeForm key={currentIncome.id} data={currentIncome} />}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
