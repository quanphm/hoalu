import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Link } from "@tanstack/react-router";
import { intlFormatDistance } from "date-fns";
import { StarIcon } from "lucide-react";

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
		<Link to="/$slug" params={{ slug: props.slug }}>
			<Card className="hover:border-foreground/20">
				<CardHeader className="flex flex-row items-start justify-between p-4">
					<CardTitle className="text-base">{props.name}</CardTitle>
					<Button variant="link" size="icon" className="h-4 w-4">
						<StarIcon className="size-4" />
					</Button>
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<p className="text-muted-foreground text-xs">
						Created {intlFormatDistance(props.createdAt, new Date())}
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}
