import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";
import { worker } from "@electric-sql/pglite/worker";

worker({
	async init(options) {
		const pg = await PGlite.create({
			dataDir: "idb://hoalu",
			relaxedDurability: true,
			/**
			 * @see https://pglite.dev/docs/multi-tab-worker#extension-support
			 */
			extensions: {
				vector,
				...options.extensions,
			},
		});

		const tables = await pg.query(
			`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`,
		);
		if (tables.rows.length === 0) {
			console.log("run migrations");
		}

		return pg;
	},
});
