import { XIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

import type { ReactNode } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");

export interface TransactionNavigation {
	onClose: () => void;
	onGoUp: () => void;
	onGoDown: () => void;
	canGoUp: boolean;
	canGoDown: boolean;
}

export function TransactionPageHeader(props: {
	title: ReactNode;
	actions?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn("flex items-center justify-between gap-4 border-b px-4 py-2", props.className)}
		>
			<div className="flex min-w-0 items-center gap-2 text-sm">
				<span className="text-muted-foreground truncate">{props.title}</span>
			</div>
			{props.actions && (
				<div className="flex shrink-0 items-center justify-center gap-2">{props.actions}</div>
			)}
		</div>
	);
}

export function TransactionCloseAction(props: { onClose?: () => void }) {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon-sm"
						variant="outline"
						onClick={
							props.onClose ?? (() => navigate({ to: "/$slug/transactions", params: { slug } }))
						}
					/>
				}
			>
				<XIcon />
			</TooltipTrigger>
			<TooltipContent side="bottom">Close</TooltipContent>
		</Tooltip>
	);
}

const MAIN_SPAN = {
	4: "lg:col-span-4",
	6: "lg:col-span-6",
	8: "lg:col-span-8",
	12: "lg:col-span-12",
} as const;

export function TransactionPageGrid(props: {
	main: ReactNode;
	aside?: ReactNode;
	/**
	 * Hold the main column at its two-column width even when there is no aside,
	 * so a page without a side panel lines up with one that has it.
	 */
	keepAsideColumn?: boolean;
	/** Columns the main panel takes on `lg` and up. Defaults to 8 beside an aside, 12 without. */
	mainSpan?: keyof typeof MAIN_SPAN;
}) {
	const showAsideColumn = Boolean(props.aside) || Boolean(props.keepAsideColumn);
	const mainSpan = props.mainSpan ?? (showAsideColumn ? 8 : 12);

	return (
		<div className="grid grid-cols-12 gap-6 p-4 md:p-6">
			<div className={cn("col-span-12", MAIN_SPAN[mainSpan])}>{props.main}</div>
			{showAsideColumn && <div className="col-span-12 lg:col-span-4">{props.aside}</div>}
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

/**
 * The commit sits under the fields it commits, not in the page header: the button belongs to the
 * form, and a form-wide action inside a toolbar reads as a page-level one. `status` is the slot
 * for an unsaved-changes note on the opposite side.
 */
export function TransactionSubmitRow(props: { status?: ReactNode; children: ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="text-muted-foreground min-w-0 text-xs">{props.status}</div>
			<div className="flex shrink-0 items-center gap-2">{props.children}</div>
		</div>
	);
}

/**
 * Sits beside the submit button of a create page. A create form is seeded from a persisted draft,
 * so its fields can be filled before the user types anything; this throws that draft away.
 */
export function TransactionResetButton(props: { onClick: () => void }) {
	return (
		<Button variant="ghost" onClick={props.onClick}>
			Reset
		</Button>
	);
}
