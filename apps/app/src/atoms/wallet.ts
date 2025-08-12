import { atom } from "jotai";

import type { WalletSchema } from "@/lib/schema";

export const expenseWalletFilterAtom = atom<WalletSchema["id"][]>([]);
