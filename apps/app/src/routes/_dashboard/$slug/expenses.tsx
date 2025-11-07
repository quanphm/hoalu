import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { ExpenseDetails } from "#app/components/expenses/expense-details.tsx";
import { ExpenseFilter } from "#app/components/expenses/expense-filter.tsx";
import ExpenseList from "#app/components/expenses/expense-list.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionItem,
	SectionTitle,
} from "#app/components/layouts/section.tsx";

const searchSchema = z.object({
	date: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Expenses</SectionTitle>
				<CreateExpenseDialogTrigger />
			</SectionHeader>

			<SectionContent columns={12} className="h-[calc(100vh-76px)] gap-0 overflow-hidden">
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
