import { countriesEmoji } from "./data/countries.emoji";
import type { TCountryCode } from "./types";

// Country code should contain exactly 2 uppercase characters from A..Z
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

export const getEmojiFlag = (iso2: TCountryCode) => {
	return COUNTRY_CODE_REGEX.test(iso2) ? countriesEmoji[iso2] : "";
};
