import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRightIcon, StarIcon } from "lucide-react";

interface Props {
	id: number;
	name: string;
	slug: string;
	createdAt: Date;
	publicId: string;
	logo?: string | null | undefined;
}

export function WorkspaceCard(props: Props) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between p-4">
				<div className="space-y-1.5">
					<CardTitle className="text-base">{props.name}</CardTitle>
					<CardDescription>Created {format(props.createdAt, "dd MMM yyyy")}</CardDescription>
				</div>
				<Button variant="link" size="icon" className="h-4 w-4">
					<StarIcon className="size-4" />
				</Button>
			</CardHeader>
			<CardContent className="p-4">
				<div className="flex">
					<Button variant="outline" className="ml-auto" asChild>
						<Link to="/$slug" params={{ slug: props.slug }}>
							Explore <ArrowRightIcon className="ml-1.5 size-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
