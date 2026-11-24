type CollectionWithCleanup = {
	cleanup: (options?: { dependents?: boolean }) => Promise<void> | void;
};

const isDev = import.meta.env.DEV;
const debug = false;

function debugLog(name: string, message: string) {
	if (isDev && debug) {
		console.log(`[collection: ${name}] ${message}`);
	}
}

export function createCollectionFactory<T extends CollectionWithCleanup>(
	name: string,
	createFn: (slug: string) => T,
) {
	const instances = new Map<string, T>();

	return {
		get(slug: string): T {
			const existing = instances.get(slug);
			if (existing) {
				debugLog(name, `Cache hit for "${slug}"`);
				return existing;
			}

			debugLog(name, `Cache miss, creating for "${slug}"`);
			const collection = createFn(slug);
			instances.set(slug, collection);
			return collection;
		},

		has(slug: string) {
			return instances.has(slug);
		},

		async clear(slug?: string) {
			if (slug) {
				debugLog(name, `Clearing "${slug}"`);
				const collection = instances.get(slug);
				if (collection) {
					instances.delete(slug);
					await collection.cleanup({ dependents: true });
				}
			} else {
				debugLog(name, `Clearing all (${instances.size} instances)`);
				const collections = Array.from(instances.values());
				instances.clear();
				await Promise.all(
					collections.map((collection) => collection.cleanup({ dependents: true })),
				);
			}
		},

		debug() {
			if (isDev) {
				console.log({
					name,
					instanceCount: instances.size,
					slugs: Array.from(instances.keys()),
				});
			}
		},
	};
}
