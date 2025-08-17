export function htmlToText(html: string | null) {
	if (!html) return "";

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	const scripts = doc.querySelectorAll("script, style");
	scripts.forEach((el) => {
		el.remove();
	});

	return doc.body.textContent || doc.body.innerText || "";
}
