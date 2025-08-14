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

const clickSound = new Audio("/sounds/click.ogg");
export const playClickSound = () => soundSafePlay(clickSound);

const dropSound = new Audio("/sounds/drop.ogg");
export const playDropSound = () => soundSafePlay(dropSound);

const confirmSound = new Audio("/sounds/confirmation.ogg");
export const playConfirmSound = () => soundSafePlay(confirmSound);

const errorSound = new Audio("/sounds/error.ogg");
export const playErrorSound = () => soundSafePlay(errorSound);
