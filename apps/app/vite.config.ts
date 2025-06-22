import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { type ManifestOptions, VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

const pwaOptions: Partial<VitePWAOptions> = {
	registerType: "prompt",
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
		theme_color: "#242a3a",
		background_color: "#242a3a",
	},
	workbox: {
		cleanupOutdatedCaches: true,
		maximumFileSizeToCacheInBytes: 10_000_000,
		globPatterns: ["**/*.{js,css,html,svg,data,wasm}"],
	},
	devOptions: {
		enabled: process.env.SW_DEV === "true",
		type: "module",
		navigateFallback: "index.html",
	},
};

const replaceOptions = { __DATE__: new Date().toISOString() };
const claims = process.env.CLAIMS === "true";
const reload = process.env.RELOAD_SW === "true";
const selfDestroying = process.env.SW_DESTROY === "true";

if (process.env.SW === "true") {
	pwaOptions.srcDir = "src";
	pwaOptions.filename = claims ? "claims-sw.ts" : "prompt-sw.ts";
	pwaOptions.strategies = "injectManifest";
	(pwaOptions.manifest as Partial<ManifestOptions>).name = "PWA Inject Manifest";
	(pwaOptions.manifest as Partial<ManifestOptions>).short_name = "PWA Inject";
	pwaOptions.injectManifest = {
		minify: false,
		enableWorkboxModulesLogs: true,
	};
}

if (claims) pwaOptions.registerType = "autoUpdate";

if (reload) {
	// @ts-expect-error just ignore
	replaceOptions.__RELOAD_SW__ = "true";
}

if (selfDestroying) pwaOptions.selfDestroying = selfDestroying;

export default defineConfig({
	envPrefix: "PUBLIC_",
	plugins: [
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: false }),
		react(),
		VitePWA(pwaOptions),
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
