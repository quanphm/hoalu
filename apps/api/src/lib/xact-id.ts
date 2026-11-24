import { sql } from "drizzle-orm";

import { db } from "#api/db/index.ts";

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function currentXactId(tx: Transaction): Promise<number> {
	const result = await tx.execute<{ txid: string }>(
		sql`SELECT pg_current_xact_id()::xid::text AS txid`,
	);

	const txid = result.rows[0]?.txid;
	if (txid === undefined) {
		throw new Error("Could not read the current transaction id");
	}

	const parsed = Number.parseInt(txid, 10);
	if (Number.isNaN(parsed)) {
		throw new Error(`Invalid transaction id: ${txid}`);
	}

	return parsed;
}
