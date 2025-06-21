import { datetime } from "@hoalu/common/datetime";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";

interface BasicCardProps extends Omit<React.ComponentProps<"div">, "title" | "content"> {
	title?: React.ReactNode;
	description?: string | null;
	actions?: React.ReactNode;
	content?: React.ReactNode;
	footer?: React.ReactNode;
}

function ContentCard({
	className,
	title,
	description,
	actions,
	content,
	footer,
	...props
}: BasicCardProps) {
	return (
		<Card className={className} {...props}>
			{(title || description) && (
				<CardHeader>
					{title && <CardTitle className="text-base">{title}</CardTitle>}
					{description && <CardDescription>{description}</CardDescription>}
					{actions && <CardAction>{actions}</CardAction>}
				</CardHeader>
			)}
			{content && <CardContent>{content}</CardContent>}
			{footer && <CardFooter>{footer}</CardFooter>}
		</Card>
	);
}

interface WorkspaceCardProps {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	publicId: string;
	logo?: string | null | undefined;
}

function WorkspaceCard(props: WorkspaceCardProps) {
	return (
		<Card className="hover:border-foreground/20">
			<CardHeader>
				<CardTitle>{props.name}</CardTitle>
			</CardHeader>
			<CardContent className="text-muted-foreground text-xs">
				Created {datetime.intlFormatDistance(props.createdAt, new Date())}
			</CardContent>
		</Card>
	);
}

interface SettingCardProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	description?: React.ReactNode;
}

function SettingCard({ className, title, description, children, ...props }: SettingCardProps) {
	return (
		<Card className={className} {...props}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

export { ContentCard, WorkspaceCard, SettingCard };
