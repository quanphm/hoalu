import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { TasksTable } from "@/components/tasks-table";
import type { TaskSchema } from "@/lib/schema";
import { taskKeys } from "@/services/query-key-factory";
import { tasksQueryOptions } from "@/services/query-options";
import { tasksShapeOptions, withWorkspace } from "@/services/shape-options";
import { useDokiShape } from "@hoalu/doki";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(tasksQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data } = useDokiShape<TaskSchema>({
		syncKey: taskKeys.all(slug),
		optionsFn: () => withWorkspace(tasksShapeOptions),
	});

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Tasks</SectionTitle>
				<Button variant="outline" size="sm">
					<PlusIcon className="mr-2 size-4" />
					Create task
				</Button>
			</SectionHeader>
			<SectionContent>
				<TasksTable data={data} />
			</SectionContent>
		</Section>
	);
}
