import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	envPrefix: "PUBLIC_",
	plugins: [
		tailwindcss(),
		TanStackRouterVite(),
		react(),
		VitePWA({
			registerType: "autoUpdate",
			workbox: {
				maximumFileSizeToCacheInBytes: 10_000_000,
				globPatterns: ["**/*.{js,css,html,svg,data,wasm}"],
			},
		}),
	],
	optimizeDeps: {
		exclude: ["@electric-sql/pglite"],
	},
	worker: {
		format: "es",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "0.0.0.0",
	},
	preview: {
		port: 5173,
	},
});
