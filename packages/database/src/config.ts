import { Kysely, PostgresDialect } from "kysely";
import type { Pool } from "pg";
import type { Database } from "./types";

export class TssdDatabase {
	private client: Kysely<Database>;

	/**
	 * @description A flexible way to access `Kysely` API directly. Only use this when `query` and
	 * `action` doesn't include any methods that you needed.
	 */
	api: Kysely<Database>;

	constructor(pool: Pool) {
		this.client = new Kysely({
			dialect: new PostgresDialect({ pool }),
		});
		this.api = this.client;
	}
}
