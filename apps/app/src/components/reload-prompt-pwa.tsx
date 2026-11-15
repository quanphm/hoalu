import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogPopup,
	AlertDialogTitle,
} from "@hoalu/ui/alert-dialog";
import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const UPDATE_CHECK_THROTTLE_MS = 5 * 60 * 1000;

export function ReloadPromptPwa() {
	const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			registrationRef.current = registration;
		},
	});

	useEffect(() => {
		let lastCheckedAt = 0;
		const checkForUpdate = () => {
			const now = Date.now();
			if (
				document.visibilityState !== "visible" ||
				now - lastCheckedAt < UPDATE_CHECK_THROTTLE_MS
			) {
				return;
			}
			lastCheckedAt = now;
			void registrationRef.current?.update();
		};

		const interval = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
		document.addEventListener("visibilitychange", checkForUpdate);

		return () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", checkForUpdate);
		};
	}, []);

	return (
		<AlertDialog
			open={needRefresh}
			onOpenChange={(open) => {
				if (!open) {
					setNeedRefresh(false);
				}
			}}
		>
			<AlertDialogPopup>
				<AlertDialogHeader>
					<AlertDialogTitle>Application update available</AlertDialogTitle>
					<AlertDialogDescription>
						A new version of Hoalu is ready. Reload to pick up the latest changes.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setNeedRefresh(false)}>Later</AlertDialogCancel>
					<AlertDialogAction onClick={() => updateServiceWorker()}>Reload</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogPopup>
		</AlertDialog>
	);
}
