import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { TasksTable } from "@/components/tasks-table";
import { useSyncShape } from "@/hooks/use-sync-shape";
import type { taskSchema } from "@/lib/schema";
import { tasksShapeOptions, withWorkspaceId } from "@/services/shape-options";
import { createFileRoute } from "@tanstack/react-router";

type Task = typeof taskSchema.infer;

export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useSyncShape(withWorkspaceId<Task>(tasksShapeOptions));

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
