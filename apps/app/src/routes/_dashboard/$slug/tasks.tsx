import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { TasksTable } from "@/components/tasks-table";
import type { taskSchema } from "@/lib/schema";
import { tasksQueryOptions } from "@/services/query-options";
import { tasksShapeOptions, withWorkspace } from "@/services/shape-options";
import { useDokiShape } from "@hoalu/doki";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

type Task = typeof taskSchema.infer;

export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(tasksQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useDokiShape<Task>({
		syncKey: ["tasks", "all"],
		optionsFn: () => withWorkspace(tasksShapeOptions),
	});

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Tasks</SectionTitle>
				<Button variant="outline" size="sm">
					<PlusIcon className="mr-2 size-4" />
					Add
				</Button>
			</SectionHeader>
			<SectionContent>
				<TasksTable data={data} />
			</SectionContent>
		</Section>
	);
}
