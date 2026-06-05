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
			output: {
				codeSplitting: false,
			},
		},
		target: "node24",
		minify: false,
		cssMinify: false,
		modulePreload: false,
	},
});
