import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { TasksTable } from "@/components/tasks-table";
import { tasksShapeOptions } from "@/services/shape-options";
import { preloadShape, useShape } from "@electric-sql/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	loader: async () => {
		await preloadShape(tasksShapeOptions({ workspaceId: "0194e972-3dd1-772c-aec2-4f95939cdd4d" }));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useShape(
		tasksShapeOptions({ workspaceId: "0194e972-3dd1-772c-aec2-4f95939cdd4d" }),
	);

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
