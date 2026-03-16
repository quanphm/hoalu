type CollectionWithCleanup = { cleanup: () => void };

const isDev = import.meta.env.DEV;

function debugLog(name: string, message: string) {
	if (isDev) {
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

		clear(slug?: string) {
			if (slug) {
				debugLog(name, `Clearing "${slug}"`);
				const collection = instances.get(slug);
				if (collection) {
					collection.cleanup();
					instances.delete(slug);
				}
			} else {
				debugLog(name, `Clearing all (${instances.size} instances)`);
				for (const collection of instances.values()) {
					collection.cleanup();
				}
				instances.clear();
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
