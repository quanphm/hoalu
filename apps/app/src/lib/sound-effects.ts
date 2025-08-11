export function soundSafePlay(sound?: HTMLAudioElement) {
	if (!sound) return;

	try {
		sound.pause();
		sound.currentTime = 0;
		sound.play().catch(() => void 0);
	} catch (err) {
		console.error(err);
	}
}

export const clickSound = new Audio("/sounds/click.ogg");
export const errorSound = new Audio("/sounds/error.ogg");
export const dropSound = new Audio("/sounds/drop.ogg");
export const confirmSound = new Audio("/sounds/confirmation.ogg");
