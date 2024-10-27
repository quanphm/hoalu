import { customAlphabet } from "nanoid";
import { v7 as uuidv7 } from "uuid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const DEFAULT_SIZE = 16;

export const id = (size = DEFAULT_SIZE) => {
	return customAlphabet(alphabet, size)();
};

export const uuid = uuidv7;
