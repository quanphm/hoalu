interface HeaderItemProps {
	label: string;
	style: React.CSSProperties;
}

export function HeaderItem({ label, style }: HeaderItemProps) {
	return (
		<div
			role="presentation"
			aria-hidden="true"
			className="text-muted-foreground absolute top-0 left-0 mt-0.5 mb-0 flex w-full items-center gap-2 p-2 text-xs font-semibold capitalize"
			style={style}
		>
			{label}
			<div className="bg-border/50 h-px flex-1" />
		</div>
	);
}
