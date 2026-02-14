interface HeaderItemProps {
	label: string;
	style: React.CSSProperties;
}

export function HeaderItem({ label, style }: HeaderItemProps) {
	return (
		<div
			role="presentation"
			aria-hidden="true"
			className="text-muted-foreground absolute top-0 left-0 w-full px-2 py-2 text-xs font-medium"
			style={style}
		>
			{label}
		</div>
	);
}
