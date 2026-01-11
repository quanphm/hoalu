import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import {
	AlertTriangleIcon,
	ArrowDownIcon,
	ArrowUpIcon,
	WalletIcon as WalletLucideIcon,
} from "@hoalu/icons/lucide";
import { ArrowsExchangeIcon } from "@hoalu/icons/tabler";
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

import { formatNumber } from "#app/helpers/number.ts";
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
	summary?: {
		totalExpensesThisMonth: number;
		transactionCount: number;
		activeWalletsCount: number;
		trendPercentage: number;
		primaryCurrency: string;
		lastActivityAt: string | null;
		hasMissingRates?: boolean;
	};
}

export function WorkspaceCard(props: WorkspaceCardProps) {
	const { summary } = props;

	const formattedTotal = summary
		? new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: summary.primaryCurrency,
				minimumFractionDigits: 0,
				maximumFractionDigits: 2,
			}).format(monetary.fromRealAmount(summary.totalExpensesThisMonth, summary.primaryCurrency))
		: null;

	const isPositiveTrend = summary && summary.trendPercentage > 0;
	const hasNoTrend = summary && summary.trendPercentage === 0;

	return (
		<Card className="h-full gap-4 hover:border-foreground/20">
			<CardHeader>
				<CardTitle>{props.name}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{summary && (
					<>
						<div>
							<p className="text-muted-foreground text-xs">This month</p>
							<div className="flex items-baseline gap-2">
								<p className="font-semibold text-lg">{formattedTotal}</p>
								{!hasNoTrend && (
									<div
										className={`flex items-center gap-0.5 text-xs ${
											isPositiveTrend
												? "text-red-600 dark:text-red-400"
												: "text-green-600 dark:text-green-400"
										}`}
									>
										{isPositiveTrend ? (
											<ArrowUpIcon className="size-3" />
										) : (
											<ArrowDownIcon className="size-3" />
										)}
										<span>{Math.abs(summary.trendPercentage).toFixed(1)}%</span>
									</div>
								)}
							</div>
						</div>

						<div className="flex items-center gap-4 text-muted-foreground text-xs">
							<div className="flex items-center gap-1">
								<ArrowsExchangeIcon className="size-3.5" />
								<span>{formatNumber(summary.transactionCount)} transactions</span>
							</div>
							<div className="flex items-center gap-1">
								<WalletLucideIcon className="size-3.5" />
								<span>{summary.activeWalletsCount} wallets</span>
							</div>
						</div>
					</>
				)}
			</CardContent>
			<CardFooter className="flex-col items-start gap-3">
				{summary && (
					<>
						{summary.lastActivityAt ? (
							<p className="text-muted-foreground text-xs">
								Last activity: {datetime.format(summary.lastActivityAt, "d MMM yyyy")}
							</p>
						) : (
							<p className="text-muted-foreground text-xs">
								Created at {datetime.format(props.createdAt, "d MMM yyyy")}
							</p>
						)}
						{summary.hasMissingRates && (
							<div className="flex items-center gap-1.5 text-amber-600 text-xs dark:text-amber-500">
								<AlertTriangleIcon className="size-3.5" />
								<span>Some exchange rates unavailable</span>
							</div>
						)}
					</>
				)}
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
