let requested = false;

export async function requestPersistentStorage(): Promise<boolean> {
	if (requested || typeof navigator === "undefined" || !navigator.storage?.persist) {
		return false;
	}
	requested = true;

	const persisted = await navigator.storage.persist();
	if (!persisted) {
		console.warn(
			"[storage] browser declined a persistent storage grant; offline data may be evicted",
		);
	}
	return persisted;
}

export async function getStorageEstimate(): Promise<StorageEstimate | null> {
	if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
		return null;
	}
	return navigator.storage.estimate();
}
