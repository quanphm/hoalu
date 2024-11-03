import { useSyncExternalStore } from "react";

const subscribe = (callback: any) => {
	const controller = new AbortController();
	window.addEventListener("online", callback, {
		passive: true,
		signal: controller.signal,
	});
	window.addEventListener("offline", callback, {
		passive: true,
		signal: controller.signal,
	});

	return () => {
		controller.abort();
	};
};

const getSnapshot = () => {
	return navigator.onLine;
};

const getNetworkStateServerSnapshot = () => {
	throw Error("useNetworkState is a client-only hook");
};

export function useOnlineStatus() {
	return useSyncExternalStore(subscribe, getSnapshot, getNetworkStateServerSnapshot);
}
