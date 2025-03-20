import PGWorker from "@/lib/pglite-worker?worker";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { electricSync } from "@electric-sql/pglite-sync";
import { type PGliteWithLive, live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { tryCatch } from "@hoalu/common/try-catch";
import { LoaderCircleIcon } from "@hoalu/icons/lucide";
import { useEffect, useState } from "react";

let syncStarted = false;

function startSync(pg: PGliteWithLive) {
	console.log("start syncing...", pg);
}

export function LocalPostgresProvider(props: { children: React.ReactNode }) {
	const [pgForProvider, setPgForProvider] = useState<PGliteWithLive | null>(null);

	useEffect(() => {
		(async function create() {
			const { data: pg } = await tryCatch.async(
				PGliteWorker.create(new PGWorker(), {
					/**
					 * @see https://pglite.dev/docs/multi-tab-worker#extension-support
					 */
					extensions: {
						live,
						electric: electricSync(),
					},
				}),
			);

			if (!pg) return;

			console.log("PGlite worker started");
			pg.onLeaderChange(() => {
				if (pg.isLeader && !syncStarted) {
					syncStarted = true;
					startSync(pg);
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
