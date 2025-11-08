import { createFileRoute } from "@tanstack/react-router";

import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";

import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { TasksTable } from "#app/components/tasks-table.tsx";
import type { TaskSchema } from "#app/lib/schema.ts";
import { tasksQueryOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(tasksQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const data: TaskSchema[] = [];

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
