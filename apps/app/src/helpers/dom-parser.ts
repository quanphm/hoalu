const SEPARATOR = " · ";

export function htmlToText(html: string | null) {
	if (!html) return "";

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Remove script and style elements
	doc.querySelectorAll("script, style").forEach((el) => el.remove());

	// Collect text from block elements, avoiding nested duplicates
	const texts: string[] = [];
	const processed = new WeakSet<Node>();

	const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
	let node: Element | null;

	while ((node = walker.nextNode() as Element | null)) {
		const tag = node.tagName.toLowerCase();
		const isBlock =
			tag === "p" ||
			tag === "li" ||
			tag === "div" ||
			tag === "blockquote" ||
			tag.match(/^h[1-6]$/);

		if (!isBlock) continue;

		// Skip if any ancestor was already processed (avoid nested blocks)
		let skip = false;
		let parent = node.parentElement;
		while (parent && parent !== doc.body) {
			if (processed.has(parent)) {
				skip = true;
				break;
			}
			parent = parent.parentElement;
		}
		if (skip) continue;

		const text = (node.textContent || "").replace(/\s+/g, " ").trim();
		if (text) {
			texts.push(text);
			processed.add(node);
		}
	}

	return texts.join(SEPARATOR);
}
