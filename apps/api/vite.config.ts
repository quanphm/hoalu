import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "dist",
		lib: {
			entry: "src/index.ts",
			formats: ["es"],
			fileName: () => "index.mjs",
		},
		rollupOptions: {
			external: [/^node:/],
			output: {
				inlineDynamicImports: true,
			},
		},
		target: "node22",
		minify: false,
		cssMinify: false,
		modulePreload: false,
	},
});
