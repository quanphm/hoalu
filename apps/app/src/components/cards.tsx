import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";

import { UserAvatar } from "./user-avatar";
import { WalletIcon, type WalletIconProps } from "./wallets/wallet-actions";

interface BasicCardProps extends Omit<React.ComponentProps<"div">, "title" | "content"> {
	title?: React.ReactNode;
	description?: string | null;
	actions?: React.ReactNode;
	content?: React.ReactNode;
	footer?: React.ReactNode;
}

export function ContentCard({
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
					{title && <CardTitle className="text-md">{title}</CardTitle>}
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

export function WorkspaceCard(props: WorkspaceCardProps) {
	return (
		<Card className="h-full hover:border-foreground/20">
			<CardHeader>
				<CardTitle>{props.name}</CardTitle>
			</CardHeader>
			<CardContent className="text-muted-foreground text-xs">
				Created at {datetime.format(props.createdAt, "d MMM yyyy")}
			</CardContent>
		</Card>
	);
}

interface SettingCardProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	description?: React.ReactNode;
}

export function SettingCard({
	className,
	title,
	description,
	children,
	...props
}: SettingCardProps) {
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

export function ErrorCard({
	title = "Something went wrong",
	error,
	...props
}: BasicCardProps & { error?: string | Error }) {
	const message = error instanceof Error ? error.message : error;

	return (
		<ContentCard
			className="w-fit min-w-sm border-destructive/50"
			title={title}
			content={
				<pre className="rounded-sm bg-destructive/5 p-2 text-destructive text-sm">{message}</pre>
			}
			footer={props.footer}
		/>
	);
}

interface WalletCardProps {
	type: WalletIconProps["type"];
	name: string;
	description: string | null;
	owner: {
		name: string;
		image: string | null;
	};
	isActive?: boolean;
	actions?: React.ReactNode;
}

export function WalletCard(props: WalletCardProps) {
	return (
		<ContentCard
			className="flex flex-col justify-between gap-3"
			title={
				<p className="flex items-center gap-1.5">
					<WalletIcon type={props.type} />
					{props.name}
				</p>
			}
			description={props.description}
			content={
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<UserAvatar className="size-4" name={props.owner.name} image={props.owner.image} />
						<p className="text-muted-foreground text-xs leading-0">{props.owner.name}</p>
					</div>
					<Badge
						variant="outline"
						className="pointer-events-non select-none gap-1.5 rounded-full bg-card"
					>
						{props.isActive ? (
							<>
								<span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
								In use
							</>
						) : (
							<>
								<span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
								Unused
							</>
						)}
					</Badge>
				</div>
			}
			actions={props.actions}
		/>
	);
}
