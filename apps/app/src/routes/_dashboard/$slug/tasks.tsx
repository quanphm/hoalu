import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { TasksTable } from "@/components/tasks-table";
import type { taskSchema } from "@/lib/schema";
import { tasksQueryOptions } from "@/services/query-options";
import { tasksShapeOptions, withWorkspace } from "@/services/shape-options";
import { useEqSyncShape } from "@hoalu/react-eqsync";
import { createFileRoute } from "@tanstack/react-router";

type Task = typeof taskSchema.infer;

export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	loader: async ({ context: { queryClient }, params }) => {
		await queryClient.ensureQueryData(tasksQueryOptions(params.slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useEqSyncShape<Task>({
		syncKey: ["tasks", "all"],
		optionsFn: () => withWorkspace<Task>(tasksShapeOptions),
	});

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Tasks</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<TasksTable data={data} />
			</SectionContent>
		</Section>
	);
}
