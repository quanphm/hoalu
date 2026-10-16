import {
	ErrorComponent,
	type ErrorComponentProps,
	Link,
	rootRouteId,
	useMatch,
	useRouter,
} from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter();
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId,
	});
	const onGoBackClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
		e.preventDefault();
		window.history.back();
	};

	return (
		<div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
			<ErrorComponent error={error} />
			<div className="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={() => {
						router.invalidate();
					}}
					className="bg-muted text-foreground rounded-sm px-2 py-1 font-extrabold uppercase"
				>
					Try Again
				</button>
				{isRoot ? (
					<Link
						to="/"
						className="bg-muted text-foreground rounded-sm px-2 py-1 font-extrabold uppercase"
					>
						Home
					</Link>
				) : (
					<Link
						to="/"
						className="bg-muted text-foreground rounded-sm px-2 py-1 font-extrabold uppercase"
						onClick={onGoBackClick}
					>
						Go Back
					</Link>
				)}
			</div>
		</div>
	);
}
