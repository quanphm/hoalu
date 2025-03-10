import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	envPrefix: "PUBLIC_",
	build: {
		rollupOptions: {
			output: {
				experimentalMinChunkSize: 10_000,
			},
		},
	},
	plugins: [
		tailwindcss(),
		TanStackRouterVite(),
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico"],
			manifest: {
				name: "Hoalu",
				short_name: "Hoalu",
				theme_color: "#030712",
			},
			workbox: {
				maximumFileSizeToCacheInBytes: 10_000_000,
				globPatterns: ["**/*.{js,css,html,svg,data,wasm}"],
			},
		}),
	],
	define: {
		"import.meta.env.PUBLIC_APP_VERSION": JSON.stringify(process.env.npm_package_version),
	},
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
	preview: {
		port: 5173,
	},
});
