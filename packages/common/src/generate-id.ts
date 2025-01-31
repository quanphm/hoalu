import { customAlphabet } from "nanoid";
import { v7 as uuidv7 } from "uuid";

const DEFAULT_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const DEFAULT_SIZE = 16;
const nanoid = customAlphabet(DEFAULT_ALPHABET, DEFAULT_SIZE);

const prefixes = {
	user: "u_",
	workspace: "ws_",
} as const;

export function generateId(options: {
	use?: "uuid" | "nanoid";
	kind?: keyof typeof prefixes;
}) {
	const defaultAlgorithm = options.use || "nanoid";

	if (defaultAlgorithm === "uuid") {
		return uuidv7();
	}

	if (!options.kind) {
		throw new Error("generateId function is using `nanoid`, please select a prefix kind for it.");
	}

	return prefixes[options.kind] + nanoid();
}
