import { Link } from "@tanstack/react-router";

import { Button } from "@hoalu/ui/button";
import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";

export function NotFound() {
	return (
		<SuperCenteredLayout>
			<div className="space-y-2 p-2">
				<div className="text-gray-600 dark:text-gray-400">
					<p>The page you are looking for does not exist</p>
				</div>
				<p className="flex flex-wrap items-center gap-2">
					<Button onClick={() => window.history.back()}>Go back</Button>
					<Button variant="outline" asChild>
						<Link to="/">Start Over</Link>
					</Button>
				</p>
			</div>
		</SuperCenteredLayout>
	);
}
