export function createDerivedViewCache<TBuild extends (slug: string) => unknown>(build: TBuild) {
	type View = ReturnType<TBuild>;
	const views = new Map<string, View>();

	return {
		get(slug: string): View {
			const existing = views.get(slug);
			if (existing) return existing;
			const view = build(slug) as View;
			views.set(slug, view);
			return view;
		},
		delete(slug: string) {
			views.delete(slug);
		},
		clear() {
			views.clear();
		},
	};
}
