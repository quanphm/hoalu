export function extractLetterFromName(name: string) {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2);
}
