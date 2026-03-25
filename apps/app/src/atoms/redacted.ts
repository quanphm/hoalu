import { atomWithStorage } from "jotai/utils";

export const redactedAmountAtom = atomWithStorage("redacted_amount", true);
