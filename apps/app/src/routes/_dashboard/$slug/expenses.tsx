import { ExpensesTable } from "@/components/expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { useWorkspace } from "@/hooks/use-workspace";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	component: RouteComponent,
});

function RouteComponent() {
	const workspace = useWorkspace();
	const membersTableData = workspace.members.map((member) => ({
		id: member.user.id,
		name: member.user.name,
		email: member.user.email,
		image: member.user.image,
		role: member.role,
	}));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Expense entries</SectionTitle>
				<Button variant="outline" size="sm">
					<PlusIcon className="mr-2 size-4" />
					Create expense
				</Button>
			</SectionHeader>
			<SectionContent>
				<ExpensesTable data={membersTableData} />
			</SectionContent>
		</Section>
	);
}
