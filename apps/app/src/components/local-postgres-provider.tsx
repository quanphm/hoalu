import { PGliteProvider } from "@electric-sql/pglite-react";
import { electricSync } from "@electric-sql/pglite-sync";
import { type PGliteWithLive, live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { LoaderCircleIcon } from "@hoalu/icons/lucide";
import { useEffect, useState } from "react";

let syncStarted = false;

export function LocalPostgresProvider(props: { children: React.ReactNode }) {
	const [pgForProvider, setPgForProvider] = useState<PGliteWithLive | null>(null);

	useEffect(() => {
		(async function create() {
			const pg = await PGliteWorker.create(
				new Worker(new URL("../lib/pglite-worker.ts", import.meta.url), {
					type: "module",
				}),
				{
					dataDir: "idb://hoalu",
					relaxedDurability: true,
					/**
					 * @see https://pglite.dev/docs/multi-tab-worker#extension-support
					 */
					extensions: {
						live,
						electric: electricSync({
							debug: true,
						}),
					},
				},
			);

			console.log("PGlite worker started");
			pg.onLeaderChange(() => {
				console.log("Leader changed, isLeader:", pg.isLeader);
				if (pg.isLeader && !syncStarted) {
					syncStarted = true;
					//startSync(pg);
				}
			});

			setPgForProvider(pg);
		})();
	}, []);

	if (!pgForProvider) {
		return (
			<div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
				<LoaderCircleIcon className="h-8 w-8 animate-spin text-foreground" />
				<div className="text-center text-muted-foreground">Starting application...</div>
			</div>
		);
	}

	return <PGliteProvider db={pgForProvider}>{props.children}</PGliteProvider>;
}
