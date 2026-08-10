import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";
import { Link, getRouteApi } from "@tanstack/react-router";

import type { ReactNode } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

export interface TransactionNavigation {
	onClose: () => void;
	onGoUp: () => void;
	onGoDown: () => void;
	canGoUp: boolean;
	canGoDown: boolean;
}

export function TransactionPageHeader(props: { title: ReactNode; actions?: ReactNode }) {
	const { slug } = routeApi.useParams();
	return (
		<div className="flex items-center justify-between gap-4 border-b px-4 py-2">
			<div className="flex min-w-0 items-center gap-2 text-sm">
				<span className="text-muted-foreground truncate">{props.title}</span>
			</div>
			{props.actions && (
				<div className="flex shrink-0 items-center justify-center gap-2">{props.actions}</div>
			)}
		</div>
	);
}

export function TransactionCloseAction() {
	const { slug } = routeApi.useParams();
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon-sm"
						variant="outline"
						render={<Link to="/$slug/transactions" params={{ slug }} />}
					/>
				}
			>
				<XIcon />
			</TooltipTrigger>
			<TooltipContent side="bottom">Close</TooltipContent>
		</Tooltip>
	);
}

export function TransactionPageGrid(props: { main: ReactNode; aside?: ReactNode }) {
	return (
		<div className="grid grid-cols-12 gap-6 p-4 md:p-6">
			<div className="col-span-12 lg:col-span-8">{props.main}</div>
			{props.aside && <div className="col-span-12 lg:col-span-4">{props.aside}</div>}
		</div>
	);
}

export function TransactionSectionLabel({ children }: { children: ReactNode }) {
	return (
		<h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
			{children}
		</h3>
	);
}

interface BorderlessTitleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	value: string;
}

export function BorderlessTitleInput({ className, ...props }: BorderlessTitleInputProps) {
	return (
		<input
			{...props}
			className={cn(
				"text-foreground placeholder:text-muted-foreground/60 w-full border-none bg-transparent text-2xl font-semibold tracking-tight outline-none",
				className,
			)}
		/>
	);
}
