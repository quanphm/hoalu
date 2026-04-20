interface HeaderItemProps {
	label: string;
}

export function HeaderItem({ label }: HeaderItemProps) {
	return (
		<div
			role="presentation"
			aria-hidden="true"
			className="text-muted-foreground mt-0.5 mb-0 flex w-full items-center gap-2 p-2 text-xs font-semibold capitalize"
		>
			{label}
			<div className="bg-border/50 h-px flex-1" />
		</div>
	);
}
