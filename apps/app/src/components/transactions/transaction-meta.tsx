import type { ReactNode } from "react";

/**
 * One hairline row of pills under the amount: where the money came from, what it was for, when,
 * and the options most entries never touch. Each pill reports the value behind it, so nothing
 * hidden is ever invisible or silently different from what will be submitted.
 */
export function TransactionMetaRow({ children }: { children: ReactNode }) {
	return (
		<div className="border-border/70 flex flex-wrap items-center gap-1.5 border-t pt-4">
			{children}
		</div>
	);
}

/** Separates a region that is always open (the note) from the pill row above it. */
export function TransactionPanel({ children }: { children: ReactNode }) {
	return <div className="border-border/70 border-t pt-4">{children}</div>;
}
