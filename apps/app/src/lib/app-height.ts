const root = document.documentElement;

function measure() {
	root.style.setProperty("--app-height", `${window.innerHeight}px`);
}

/**
 * Installed iOS PWAs resolve `dvh` to the safe-area viewport while `innerHeight` reports the full
 * window, so the shell falls short of the bottom by the home-indicator inset and a bottom bar padded
 * by `env(safe-area-inset-bottom)` ends up a whole inset too high. Measuring the window is right in
 * both modes: in a browser tab `innerHeight` already tracks the URL bar, the same as `dvh`.
 * WebKit bugs: 242758, 261185.
 */
export function trackAppHeight() {
	measure();
	window.addEventListener("resize", measure);
	window.addEventListener("orientationchange", () => {
		requestAnimationFrame(measure);
	});
}
