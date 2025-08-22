import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";

import { CreateExpenseDialogTrigger } from "@/components/expenses/expense-actions";
import { ExpenseDetails } from "@/components/expenses/expense-details";
import { ExpenseFilter } from "@/components/expenses/expense-filter";
import ExpenseList from "@/components/expenses/expense-list";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionItem,
	SectionTitle,
} from "@/components/layouts/section";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: type({
		"date?": "string",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Expenses</SectionTitle>
				<CreateExpenseDialogTrigger />
			</SectionHeader>

			<SectionContent columns={12} className="h-[calc(100vh-92px)] gap-0 overflow-hidden">
				<SectionItem
					data-slot="expense-filter"
					desktopSpan="col-span-2"
					tabletSpan={1}
					mobileOrder={3}
					className="pr-4 pb-4"
				>
					<ExpenseFilter />
				</SectionItem>

				<SectionItem
					data-slot="expense-list"
					desktopSpan="col-span-4"
					tabletSpan={1}
					mobileOrder={1}
				>
					<ExpenseList />
				</SectionItem>

				<SectionItem
					data-slot="expense-details"
					desktopSpan="col-span-6"
					tabletSpan={1}
					mobileOrder={2}
				>
					<ExpenseDetails />
				</SectionItem>
			</SectionContent>
		</Section>
	);
}
