import html2canvas from "html2canvas-pro";
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
		async (element: HTMLElement) => {
			if (!element) {
				console.error("Element not found");
				setStatus("error");
				return;
			}
			if (!navigator.clipboard) {
				console.error("Clipboard not supported in this browser");
				setStatus("error");
				return;
			}

			setStatus("pending");

			try {
				const canvas = await html2canvas(element, {
					backgroundColor: "transparent",
					scale,
					width: element.offsetWidth,
					height: element.offsetHeight,
					logging: true,
					onclone: (clonedDoc) => {
						const style = clonedDoc.createElement("style");
						style.textContent = `
							* { border-radius: 0 }
							.border, .border-border { border-color: transparent; }
							.hide-in-screenshot { display: none; }
						`;
						clonedDoc.head.appendChild(style);
					},
				});

				canvas.toBlob(async (blob) => {
					if (!blob) {
						console.error("Failed to generate image");
						setStatus("error");
						return;
					}

					try {
						await navigator.clipboard.write([
							new ClipboardItem({
								"image/png": blob,
							}),
						]);
						setStatus("success");
					} catch (clipboardError) {
						console.error("Failed to copy to clipboard:", clipboardError);
						setStatus("error");
					} finally {
						setTimeout(() => setStatus("idle"), 1500);
					}
				}, "image/png");
			} catch (screenshotError) {
				console.error("Failed to take screenshot:", screenshotError);
				setStatus("error");
			}
		},
		[scale],
	);

	return {
		takeScreenshot,
		status,
	};
}
