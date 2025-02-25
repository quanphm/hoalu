import { ContentCard } from "@/components/cards";
import { ExpensesStats } from "@/components/expenses-stats";
import { ExpensesTable } from "@/components/expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { useWorkspace } from "@/hooks/use-workspace";
import { walletsQueryOptions } from "@/services/query-options";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/finance/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const workspace = useWorkspace();
	const wallets = useSuspenseQuery(walletsQueryOptions(params.slug));
	const membersTableData = workspace.members.map((member) => ({
		id: member.user.id,
		name: member.user.name,
		email: member.user.email,
		image: member.user.image,
		role: member.role,
	}));

	return (
		<>
			<Section>
				<SectionContent columns={2}>
					<Section>
						<SectionHeader>
							<SectionTitle>Overview</SectionTitle>
						</SectionHeader>
						<SectionContent>
							<ExpensesStats />
						</SectionContent>
					</Section>
					<Section>
						<SectionHeader>
							<SectionTitle>Wallets ({wallets.data.length})</SectionTitle>
							<Button variant="outline" size="sm">
								<PlusIcon className="mr-2 size-4" />
								Add
							</Button>
						</SectionHeader>
						<SectionContent columns={2} className="gap-2">
							{wallets.data.map((wallet) => (
								<ContentCard
									key={wallet.id}
									title={wallet.name}
									content={wallet.description ?? ""}
								/>
							))}
						</SectionContent>
					</Section>
				</SectionContent>
			</Section>
			<Section>
				<SectionHeader>
					<SectionTitle>Recent entries</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<ExpensesTable data={membersTableData} />
				</SectionContent>
			</Section>
		</>
	);
}
