import { customAlphabet } from "nanoid";

const DEFAULT_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const DEFAULT_SIZE = 16;

export const nanoid = customAlphabet(DEFAULT_ALPHABET, DEFAULT_SIZE);

const prefixes = {
	user: "u",
	workspace: "ws",
} as const;

export function newId(type: keyof typeof prefixes) {
	return [prefixes[type], nanoid()].join("_");
}
