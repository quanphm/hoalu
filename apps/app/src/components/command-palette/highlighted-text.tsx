import type { ReactNode } from "react";

export function HighlightedText({ text, ranges }: { text: string; ranges: number[] | null }) {
	if (!ranges || ranges.length === 0) {
		return <>{text}</>;
	}

	const parts: ReactNode[] = [];
	let lastEnd = 0;

	for (let i = 0; i < ranges.length; i += 2) {
		const start = ranges[i];
		const end = ranges[i + 1];

		// Text before the match
		if (start > lastEnd) {
			parts.push(text.slice(lastEnd, start));
		}

		// Matched text
		parts.push(
			<mark key={i} className="rounded-xs bg-yellow-400/30 text-inherit">
				{text.slice(start, end)}
			</mark>,
		);

		lastEnd = end;
	}

	// Remaining text after last match
	if (lastEnd < text.length) {
		parts.push(text.slice(lastEnd));
	}

	return <>{parts}</>;
}
