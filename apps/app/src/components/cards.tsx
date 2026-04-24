import { datetime } from "@hoalu/common/datetime";
import { ArrowRightIcon } from "@hoalu/icons/lucide";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";
import { cn } from "@hoalu/ui/utils";

import { CurrencyValue } from "./currency-value";
import { WorkspaceLogo } from "./workspace";

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

function formatLastActive(dateStr: string) {
	const date = new Date(dateStr);
	const isToday = date.toDateString() === new Date().toDateString();
	return isToday ? `Today, ${datetime.format(date, "HH:mm")}` : datetime.format(date, "d MMM yyyy");
}

interface WorkspaceCardProps {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	publicId: string;
	logo?: string | null | undefined;
	summary?: {
		totalExpensesThisMonth: number;
		transactionCount: number;
		activeWalletsCount: number;
		primaryCurrency: string;
		lastActivityAt: string | null;
		hasMissingRates?: boolean;
	};
}

export function WorkspaceCard(props: WorkspaceCardProps) {
	const { summary } = props;

	const lastActive = summary?.lastActivityAt
		? formatLastActive(summary.lastActivityAt)
		: datetime.format(props.createdAt, "d MMM yyyy");

	return (
		<Card className="gap-0 rounded-md py-3">
			<CardHeader className="pb-2.5">
				<CardTitle className="flex items-center gap-3 text-base font-semibold">
					<WorkspaceLogo logo={null} name={props.name} />
					{props.name}
				</CardTitle>
			</CardHeader>
			<div className="border-border border-t" />
			{summary && (
				<CardContent
					className={cn("grid grid-cols-2 py-0", "*:py-2.5 *:last:border-l *:last:pl-4")}
				>
					<div>
						<p className="text-muted-foreground text-2xs font-medium tracking-widest uppercase">
							Expenses • MTD
						</p>
						<CurrencyValue
							style="currency"
							value={summary.totalExpensesThisMonth}
							currency={summary.primaryCurrency}
							className="text-lg font-semibold"
						/>
					</div>
					<div>
						<p className="text-muted-foreground text-2xs font-medium tracking-widest uppercase">
							Incomes • MTD
						</p>
						<CurrencyValue
							style="currency"
							value={summary.totalExpensesThisMonth}
							currency={summary.primaryCurrency}
							className="text-lg font-semibold"
						/>
					</div>
				</CardContent>
			)}
			<div className="border-border border-t" />
			<CardFooter className="flex items-center justify-between pt-2.5">
				<p className="text-muted-foreground text-xs">
					Last activity <span className="text-foreground ml-1">{lastActive}</span>
				</p>
				<div
					data-slot="card-footer-action"
					className="text-muted-foreground group-hover:text-primary flex items-center gap-1 text-xs transition-colors"
				>
					Open <ArrowRightIcon className="size-3" />
				</div>
			</CardFooter>
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
			className="border-destructive/50 w-fit min-w-sm"
			title={title}
			content={
				<pre className="bg-destructive/5 text-destructive rounded-sm p-2 text-sm">{message}</pre>
			}
			footer={props.footer}
		/>
	);
}
