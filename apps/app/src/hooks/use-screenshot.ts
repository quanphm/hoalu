import { useCallback, useState } from "react";

interface UseScreenshotOptions {
	/**
	 * @default 2
	 */
	scale?: number;
}

export function useScreenshot({ scale = 2 }: UseScreenshotOptions = {}) {
	const [status, setStatus] = useState<"idle" | "success" | "error" | "pending">("idle");

	const takeScreenshot = useCallback(
		async (element?: HTMLElement | null) => {
			if (!element) {
				throw new Error("Element not found");
			}
			if (!navigator.clipboard) {
				throw new Error("Clipboard not supported in this browser");
			}

			try {
				setStatus("pending");

				const { default: html2canvas } = await import("html2canvas-pro");
				const canvas = await html2canvas(element, {
					backgroundColor: "transparent",
					scale,
					width: element.offsetWidth,
					height: element.offsetHeight,
					logging: import.meta.env.DEV,
					useCORS: true,
					onclone: (clonedDoc) => {
						const style = clonedDoc.createElement("style");
						style.textContent = `
							* { border-radius: 0; }
							.border, .border-border { border-color: transparent; }
							.hide-in-screenshot { display: none; }
						`;
						clonedDoc.head.appendChild(style);
					},
				});

				const blob: Blob | null = await new Promise((resolve) =>
					canvas.toBlob(resolve, "image/png"),
				);
				if (!blob) {
					throw new Error("Failed to generate image");
				}
				setStatus("success");
				return blob;
			} catch (screenshotError) {
				// setStatus("error");
				throw new Error("Failed to take screenshot:", { cause: screenshotError });
			} finally {
				setTimeout(() => setStatus("idle"), 1500);
			}
		},
		[scale],
	);

	return {
		takeScreenshot,
		status,
	};
}
