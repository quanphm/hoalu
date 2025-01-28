export function extractLetterFromName(name: string | undefined) {
	if (!name) return "";

	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toLocaleUpperCase();
}
