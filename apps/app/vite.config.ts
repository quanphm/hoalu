import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const THEME_COLOR = "#0f1012";

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
		tanstackRouter(),
		viteReact(),
		VitePWA({
			strategies: "generateSW",
			registerType: "prompt",
			includeAssets: [
				"images/favicon.ico",
				"images/favicon-96x96.png",
				"images/apple-touch-icon.png",
			],
			manifest: {
				id: "/",
				name: "Hoalu",
				short_name: "Hoalu",
				description:
					"Offline-first personal finance tracker for expenses, incomes, wallets and bills.",
				lang: "en",
				start_url: "/",
				scope: "/",
				display: "standalone",
				theme_color: THEME_COLOR,
				background_color: THEME_COLOR,
				icons: [
					{
						src: "/images/web-app-manifest-144x144.png",
						sizes: "144x144",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/images/web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/images/web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/images/web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
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
				maximumFileSizeToCacheInBytes: 4_000_000,
				globPatterns: ["**/*.{js,css,html,svg,woff2,data,wasm}"],
				navigateFallbackDenylist: [/^\/api\//],
			},
			devOptions: {
				enabled: process.env.SW_DEV === "true",
				type: "module",
				navigateFallback: "index.html",
			},
		}),
	],
	define: {
		"import.meta.env.PUBLIC_APP_VERSION": JSON.stringify(process.env.npm_package_version),
	},
	build: {
		target: "esnext",
		cssMinify: "lightningcss",
		modulePreload: { polyfill: false },
		rollupOptions: {
			output: {
				codeSplitting: {
					groups: [{ name: "vendor", test: /[\\/]node_modules[\\/]/ }],
				},
			},
		},
	},
	optimizeDeps: {
		exclude: ["@electric-sql/pglite"],
	},
});
