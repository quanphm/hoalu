import { defineConfig } from "@tanstack/start/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		preset: "bun",
	},
	tsr: {
		appDirectory: "src",
	},
	vite: {
		plugins: [tsconfigPaths()],
	},
});
