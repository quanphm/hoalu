type CollectionWithCleanup = { cleanup: () => void };

export function createCollectionFactory<T extends CollectionWithCleanup>(
	_name: string,
	createFn: (slug: string) => T,
) {
	const instances = new Map<string, T>();

	return {
		get(slug: string): T {
			const existing = instances.get(slug);
			if (existing) return existing;

			const collection = createFn(slug);
			instances.set(slug, collection);
			return collection;
		},

		has(slug: string) {
			return instances.has(slug);
		},

		clear(slug?: string) {
			if (slug) {
				const collection = instances.get(slug);
				if (collection) {
					collection.cleanup();
					instances.delete(slug);
				}
			} else {
				for (const collection of instances.values()) {
					collection.cleanup();
				}
				instances.clear();
			}
		},
	};
}
