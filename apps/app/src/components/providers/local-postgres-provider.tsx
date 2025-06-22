import { live, type PGliteWithLive } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { electricSync } from "@electric-sql/pglite-sync";
import { useEffect, useState } from "react";

import { tryCatch } from "@hoalu/common/try-catch";
import { LoaderCircleIcon } from "@hoalu/icons/lucide";
import PGWorker from "@/lib/pglite-worker?worker";

let syncStarted = false;
async function startSync(pg: PGliteWithLive) {
	console.log("start syncing...", pg);

	const tables = await pg.query(
		`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`,
	);
	if (tables.rows.length === 0) {
		console.log("run migrations");
	}
}

export function LocalPostgresProvider(props: { children: React.ReactNode }) {
	const [pgForProvider, setPgForProvider] = useState<PGliteWithLive | null>(null);

	useEffect(() => {
		(async function create() {
			const { data: pg } = await tryCatch.async(
				PGliteWorker.create(new PGWorker(), {
					dataDir: "idb://hoalu",
					extensions: {
						live,
						electric: electricSync(),
					},
				}),
			);

			if (!pg) return;

			console.log("PGlite worker started");
			if (!syncStarted) {
				await startSync(pg);
				syncStarted = true;
			}

			setPgForProvider(pg);
		})();
	}, []);

	if (!pgForProvider) {
		return (
			<div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
				<LoaderCircleIcon className="h-8 w-8 animate-spin text-foreground" />
				<p className="flex gap-2 text-muted-foreground">Starting application</p>
				<p className="text-muted-foreground text-sm leading-none tracking-wider">
					{import.meta.env.PUBLIC_APP_VERSION}
				</p>
			</div>
		);
	}

	return <PGliteProvider db={pgForProvider}>{props.children}</PGliteProvider>;
}
