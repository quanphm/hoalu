import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";
import { worker } from "@electric-sql/pglite/worker";

worker({
	async init(options) {
		const pg = await PGlite.create({
			dataDir: options.dataDir,
			relaxedDurability: true,
			extensions: {
				vector,
				...options.extensions,
			},
		});
		return pg;
	},
});
