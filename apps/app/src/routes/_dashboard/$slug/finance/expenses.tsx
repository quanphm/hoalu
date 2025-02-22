import { ExpensesTable } from "@/components/expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { useWorkspace } from "@/hooks/use-workspace";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/finance/expenses")({
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
				<SectionTitle>Entries</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<ExpensesTable data={membersTableData} />
			</SectionContent>
		</Section>
	);
}
