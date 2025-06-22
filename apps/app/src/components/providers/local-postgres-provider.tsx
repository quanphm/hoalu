import { useRegisterSW } from "virtual:pwa-register/react";
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { live, type PGliteWithLive } from "@electric-sql/pglite/live";
import { vector } from "@electric-sql/pglite/vector";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { electricSync } from "@electric-sql/pglite-sync";
import { useEffect, useState } from "react";

import { tryCatch } from "@hoalu/common/try-catch";
import { LoaderCircleIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";

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
	const { updateServiceWorker } = useRegisterSW();

	useEffect(() => {
		(async function create() {
			const { data: pg } = await tryCatch.async(
				PGlite.create({
					dataDir: "idb://hoalu",
					relaxedDurability: true,
					extensions: {
						live,
						vector,
						citext,
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

	const handleHardReload: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		event.preventDefault();
		updateServiceWorker();
	};

	if (!pgForProvider) {
		return (
			<div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
				<LoaderCircleIcon className="size-8 animate-spin text-foreground" />
				<div className="flex items-center gap-2">
					<p className="flex gap-2 text-muted-foreground">Starting</p>
					{"-"}
					<p className="text-muted-foreground">v{import.meta.env.PUBLIC_APP_VERSION}</p>
				</div>
				<Button variant="outline" onClick={handleHardReload}>
					Reload
				</Button>
			</div>
		);
	}

	return <PGliteProvider db={pgForProvider}>{props.children}</PGliteProvider>;
}
