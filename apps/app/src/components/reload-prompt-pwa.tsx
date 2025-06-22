import { pwaInfo } from "virtual:pwa-info";
import { useRegisterSW } from "virtual:pwa-register/react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@hoalu/ui/alert-dialog";

console.log(pwaInfo);

export function ReloadPromptPwa() {
	// replaced dynamically
	const buildDate: string = "__DATE__";
	// replaced dyanmicaly
	const reloadSW: string = "__RELOAD_SW__";

	const {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(swUrl, r) {
			console.log(`Service Worker at: ${swUrl}`);
			if (reloadSW === "true") {
				r &&
					setInterval(() => {
						console.log("Checking for sw update");
						r.update();
					}, 20000 /* 20s for testing purposes */);
			} else {
				console.log(`SW Registered: ${r}`);
			}
		},
		onRegisterError(error: unknown) {
			console.log("SW registration error", error);
		},
	});

	const close = () => {
		setOfflineReady(false);
		setNeedRefresh(false);
	};

	console.log("offlineReady", offlineReady);
	console.log("needRefresh", needRefresh);

	return (
		<AlertDialog open={offlineReady || needRefresh}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{buildDate}</AlertDialogTitle>
					<AlertDialogDescription>
						{offlineReady ? (
							<p>App ready to work offline</p>
						) : (
							<p>New content available, click on reload button to update.</p>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => close()}>Close</AlertDialogCancel>
					{needRefresh && (
						<AlertDialogAction onClick={() => updateServiceWorker()}>Reload</AlertDialogAction>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
