import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { TasksTable } from "@/components/tasks-table";
import { preloadSyncShape, useSyncShape } from "@/hooks/use-sync-shape";
import { tasksShapeOptions } from "@/services/shape-options";
import { createFileRoute } from "@tanstack/react-router";

type Task = {
	id: string;
	done: boolean;
	name: string;
};
export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	loader: async () => {
		await preloadSyncShape<Task>(
			tasksShapeOptions<Task>({ workspaceId: "019503c5-7a93-7551-819b-bf6af7e4b688" }),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useSyncShape<Task>(
		tasksShapeOptions({ workspaceId: "019503c5-7a93-7551-819b-bf6af7e4b688" }),
	);
	console.log(data);

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
