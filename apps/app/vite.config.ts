import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

const pwaOptions: Partial<VitePWAOptions> = {
	strategies: "generateSW",
	registerType: "autoUpdate",
	includeAssets: ["favicon.ico"],
	manifest: {
		name: "Hoalu",
		short_name: "Hoalu",
		icons: [
			{
				src: "/images/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/images/web-app-manifest-144x144.png",
				sizes: "144x144",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/images/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	},
	workbox: {
		cleanupOutdatedCaches: true,
		maximumFileSizeToCacheInBytes: 10_000_000,
		globPatterns: ["**/*.{js,css,html,svg,data,wasm,woff2}"],
	},
	devOptions: {
		enabled: process.env.SW_DEV === "true",
		type: "module",
		navigateFallback: "index.html",
	},
};

export default defineConfig({
	envPrefix: "PUBLIC_",
	plugins: [
		devtools({
			consolePiping: {
				enabled: false,
			},
			enhancedLogs: {
				enabled: false,
			},
		}),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: false }),
		viteReact(),
		VitePWA(pwaOptions),
	],
	define: {
		"import.meta.env.PUBLIC_APP_VERSION": JSON.stringify(process.env.npm_package_version),
	},
	optimizeDeps: {
		exclude: ["@electric-sql/pglite"],
	},
});
