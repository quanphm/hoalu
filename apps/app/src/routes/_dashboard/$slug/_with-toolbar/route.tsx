import { redactedAmountAtom } from "#app/atoms/redacted.ts";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { SectionContent } from "#app/components/layouts/section.tsx";
import { QuickExpensesDialogTrigger } from "#app/components/quick-expenses/quick-expenses-dialog.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";
import { EyeIcon, EyeOffIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtom } from "jotai";

export const Route = createFileRoute("/_dashboard/$slug/_with-toolbar")({
	component: RouteComponent,
});

function RouteComponent() {
	const [redacted, setRedacted] = useAtom(redactedAmountAtom);

	return (
		<>
			<div
				className={"relative flex w-full flex-1 flex-col gap-4 border-b px-4 py-4 md:gap-3 md:px-8"}
			>
				<SectionContent columns={6}>
					<ScanReceiptDialogTrigger />
					{/* <VoiceExpenseDialogTrigger /> */}
					<QuickExpensesDialogTrigger />
					<CreateExpenseDialogTrigger />
					<CreateIncomeDialogTrigger />
					<CreateWalletDialogTrigger />
					<Button
						variant="outline"
						size="icon-lg"
						onClick={() => setRedacted((v) => !v)}
						title={redacted ? "Show amounts" : "Hide amounts"}
					>
						{redacted ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
					</Button>
				</SectionContent>
			</div>
			<PageContent>
				<Outlet />
			</PageContent>
		</>
	);
}
