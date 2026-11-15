import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const UPDATE_CHECK_THROTTLE_MS = 5 * 60 * 1000;

let reloadStarted = false;
let reloadPending = false;

function reloadPage() {
	if (reloadStarted) {
		return;
	}
	reloadStarted = true;
	window.location.reload();
}

function requestReload() {
	reloadPending = true;
	if (document.visibilityState === "hidden") {
		reloadPage();
	}
}

export function ServiceWorkerUpdate() {
	const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);

	useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			registrationRef.current = registration;
		},
		onNeedReload: requestReload,
	});

	useEffect(() => {
		const serviceWorker = "serviceWorker" in navigator ? navigator.serviceWorker : null;
		const controlledAtMount = Boolean(serviceWorker?.controller);
		const handleControllerChange = () => {
			if (controlledAtMount) {
				requestReload();
			}
		};
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden" && reloadPending) {
				reloadPage();
			}
		};
		serviceWorker?.addEventListener("controllerchange", handleControllerChange);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

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

	return null;
}
