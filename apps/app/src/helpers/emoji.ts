const LEADING_EMOJI = /^\p{Extended_Pictographic}/u;

function firstGrapheme(value: string): string | null {
	for (const { segment } of new Intl.Segmenter().segment(value)) {
		return segment;
	}
	return null;
}

export function splitEmojiTitle(value: string): { emoji: string | null; title: string } {
	const text = value.trimStart();
	if (!text) {
		return { emoji: null, title: "" };
	}

	const first = firstGrapheme(text);
	if (!first || !LEADING_EMOJI.test(first)) {
		return { emoji: null, title: text };
	}

	return { emoji: first, title: text.slice(first.length).trimStart() };
}

export function joinEmojiTitle(emoji: string | null, title: string): string {
	const text = title.trimStart();
	if (!emoji) {
		return text;
	}
	return text ? `${emoji} ${text}` : emoji;
}
